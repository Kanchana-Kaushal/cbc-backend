import dotenv from "dotenv";
dotenv.config();

//PORT
export const PORT = process.env.PORT;

//Database connection string
export const connString = process.env.MONGO_DB_CONN_STRING;

//Password Hashing pepper
export const pepper = process.env.PEPPER;

//JWT Secret Key
export const jwtSecretKey = process.env.JWT_KEY;

//Email
export const myEmail = process.env.EMAIL;

//App password
export const appPassword = process.env.APP_PASSWORD;

//FrontEnd URL
export const frontEndUrl = process.env.FRONTEND_URL;
