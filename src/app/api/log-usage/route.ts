import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = '1I5Z1NKJaZBYAEO-usHwUjH7KU5SRUySB-VwPng4t-fo';
const SHEET_NAME = '使用紀錄';

// 初始化 Google Sheets API
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client as any });
}

// 確保工作表和標題存在
async function ensureSheetAndHeaders(sheets: any) {
  try {
    // 取得所有工作表
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    
    const sheetExists = spreadsheet.data.sheets?.some(
      (s: any) => s.properties?.title === SHEET_NAME
    );
    
    // 如果工作表不存在，建立它
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: SHEET_NAME }
            }
          }]
        }
      });
    }
    
    // 檢查是否有標題列
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:H1`,
    });
    
    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
      // 寫入標題
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:H1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['時間', '功能', '動作', '命盤資料', '問題內容', '裝置指紋', 'IP', '瀏覽器']]
        }
      });
    }
  } catch (error) {
    console.error('確保工作表失敗:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      feature,      // 八字/紫微/綜合/易經
      action,       // 解析/追問
      chartData,    // 命盤資料
      question,     // 追問問題（如果有）
      fingerprint,  // 裝置指紋
      userAgent,    // 瀏覽器
    } = body;

    const sheets = await getSheets();
    await ensureSheetAndHeaders(sheets);

    // 格式化時間
    const now = new Date();
    const timestamp = now.toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // 格式化命盤資料
    const chartInfo = chartData 
      ? `${chartData.year || ''}/${chartData.month || ''}/${chartData.day || ''} ${chartData.shichen || ''}時 ${chartData.gender === 'male' ? '男' : '女'}`
      : '';

    // 取得 IP（從 header）
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // 寫入資料
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          timestamp,
          feature || '',
          action || '',
          chartInfo,
          question || '',
          fingerprint || '',
          ip,
          userAgent || '',
        ]]
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Log usage error:', error);
    // 不要讓 logging 失敗影響用戶體驗
    return NextResponse.json({ success: false, error: 'logging failed' });
  }
}
