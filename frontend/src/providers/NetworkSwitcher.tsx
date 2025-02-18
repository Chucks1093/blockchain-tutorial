import { useAutoSwitchNetwork } from "@/hooks/useAutoSwitchNetwork";
import { Fragment } from "react";

export default function NetworkSwitcher({
	children,
}: {
	children: React.ReactNode;
}) {
	useAutoSwitchNetwork();
	return <Fragment>{children}</Fragment>;
}
