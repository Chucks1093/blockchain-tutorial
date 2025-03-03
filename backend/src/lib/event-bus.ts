import { EventEmitter } from "events";

// Application event types for better TypeScript support
export enum AppEvent {
	// Automator events
	AUTOMATOR_DEPLOYED = "automator:deployed",
	AUTOMATOR_EXECUTION = "automator:execution",
	AUTOMATOR_ERROR = "automator:error",

	// Contract events
	CONTRACT_REGISTERED = "contract:registered",
	CONTRACT_UPDATED = "contract:updated",

	// System events
	SERVER_STARTING = "system:starting",
	SERVER_STOPPING = "system:stopping",
}

// Event payload types
export interface AutomatorDeployedEvent {
	automatorAddress: string;
	targetContract: string;
	// upkeepId: string;
	// checkInterval: number;
}

export interface AutomatorExecutionEvent {
	automatorAddress: string;
	txHash?: string;
	success: boolean;
	upkeepPerformed: boolean;
	error?: string;
}

// Create singleton event emitter
class AppEventBus extends EventEmitter {
	constructor() {
		super();
		// Set higher limit than default 10
		this.setMaxListeners(50);
	}

	// Helper method for typed events
	emitAutomatorDeployed(data: AutomatorDeployedEvent) {
		this.emit(AppEvent.AUTOMATOR_DEPLOYED, data);
		return this;
	}

	emitAutomatorExecution(data: AutomatorExecutionEvent) {
		this.emit(AppEvent.AUTOMATOR_EXECUTION, data);
		return this;
	}

	// Method to log all events (for debugging)
	enableLogging() {
		const originalEmit = this.emit;

		// Override emit to add logging
		this.emit = function (type, ...args) {
			console.log(
				`[EVENT] ${String(type)}`,
				...(args.length > 0 ? [": ", ...args] : [])
			);
			return originalEmit.apply(this, [type, ...args]);
		};

		return this;
	}
}

// Create singleton instance
export const eventBus = new AppEventBus();

// Enable logging in development
if (process.env.NODE_ENV === "development") {
	eventBus.enableLogging();
}

export default eventBus;
