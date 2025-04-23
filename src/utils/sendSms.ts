import axios from "axios";
import dotenv from 'dotenv'
import { HttpsProxyAgent } from "https-proxy-agent";
dotenv.config()

export interface smsInterface {
  key: string;
  message: string;
  recipients: [string];
}
export const sendMessage = async (message: string, recipients: [string]) => {
  const api_key = process.env.SMS_API_KEY as string;
  try {
    const response = await axios.post("https://itecsms.rw/api/sendsms", {
      key: api_key,
      message,
      recipients
    }, {
      headers: {
        "Content-Type": "application/json",
      }
      
    });

    const responseData = response.data;
    const status = responseData.status;
    console.log(response.data)

    if (status === 200) {
      const message = responseData.message;

    } else {

    }
  } catch (error) {
console.log(error)
  }
};

