import dotenv from "dotenv";

dotenv.config();

export const config = {
	port: Number(process.env.PORT) || 3000,
	allowedOrigins: [
		"http://localhost:5173",
		// Add your frontend URLs here
	],
};
