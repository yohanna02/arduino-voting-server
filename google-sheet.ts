import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";
import serviceAccountKeyFile from "./google-config";

dotenv.config();

const sheetId = process.env.SHEET_ID as string;
const tabName = process.env.TAB_NAME as string;

async function _getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKeyFile,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    return google.sheets({
        version: "v4",
        auth: authClient,
    });
}

export async function _readGoogleSheet(range: string): Promise<string[][] | null | undefined> {
    const googleSheetClient = await _getGoogleSheetClient();
    const res = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
    });

    return res.data.values;
}


export async function _writeGoogleSheet(range: string, data: any) {
    const googleSheetClient = await _getGoogleSheetClient();
    await googleSheetClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
            values: data,
            majorDimension: "ROWS"
        }
    });
}

export async function _clearGoogleSheet(range: string) {
    const googleSheetClient = await _getGoogleSheetClient();
    await googleSheetClient.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
        
    });
}
