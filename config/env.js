import dotenv from "dotenv";
dotenv.config();

//PORT
export const PORT = process.env.PORT;

//Database connection string
export const connString = process.env.MONGO_DB_CONN_STRING;
