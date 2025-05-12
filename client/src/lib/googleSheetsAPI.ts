/**
 * Google Sheets API integration for the AI Agent Builder
 * This module provides functionality to connect to and retrieve data from Google Sheets
 */

import { apiRequest } from "./queryClient";

// Interface for Google Sheets configuration
export interface GoogleSheetsConfig {
  sheetId: string;
  range: string;
  includeHeaders: boolean;
  authType: 'apiKey' | 'oauth';
}

// Interface for a spreadsheet row
export interface SpreadsheetRow {
  [key: string]: string | number | boolean | null;
}

/**
 * Validates a Google Sheets ID from a URL or direct ID
 * Accepts full URLs or just the ID portion
 */
export function validateSheetId(input: string): string | null {
  // Handle full Google Sheets URLs
  const urlRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)\/edit/;
  const urlMatch = input.match(urlRegex);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  
  // Check if it's just the ID (alphanumeric with dashes and underscores)
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  if (idRegex.test(input)) {
    return input;
  }
  
  return null;
}

/**
 * Fetches data from a Google Sheet 
 * In a real implementation, this would use the Google Sheets API
 * For this demo, we'll use our server as a proxy
 */
export async function fetchSheetData(config: GoogleSheetsConfig): Promise<SpreadsheetRow[]> {
  try {
    // In a real implementation, we would call the Google Sheets API directly
    // For this demo, we'll use our server as a proxy
    const response = await apiRequest('POST', '/api/integrations/google-sheets/fetch', config);
    const data = await response.json();
    
    if (!data || !data.data) {
      throw new Error('Invalid response from server');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw new Error('Failed to fetch data from Google Sheets');
  }
}

/**
 * Parse CSV data into structured rows
 * This is a fallback for when the Google Sheets API is not available
 * Users can paste in CSV data as an alternative
 */
export function parseCSVData(csvText: string, hasHeaders: boolean): SpreadsheetRow[] {
  // Split by lines and filter out empty lines
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];
  
  // Parse CSV, handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue); // Add the last value
    return values;
  };
  
  // Process lines into rows
  const rows: SpreadsheetRow[] = [];
  const headers = hasHeaders ? parseCSVLine(lines[0]) : [];
  
  const dataStartIndex = hasHeaders ? 1 : 0;
  
  // Process data rows
  for (let i = dataStartIndex; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (hasHeaders) {
      // Create an object with header keys
      const row: SpreadsheetRow = {};
      for (let j = 0; j < Math.min(headers.length, values.length); j++) {
        row[headers[j]] = values[j];
      }
      rows.push(row);
    } else {
      // Create an object with numeric keys
      const row: SpreadsheetRow = {};
      for (let j = 0; j < values.length; j++) {
        row[`col${j+1}`] = values[j];
      }
      rows.push(row);
    }
  }
  
  return rows;
}

/**
 * Generate sample data for a leads spreadsheet
 * This is used for demo purposes when no real data is available
 */
export function generateSampleLeadsData(): SpreadsheetRow[] {
  return [
    {
      name: "John Smith",
      company: "Acme Corp",
      email: "john.smith@acmecorp.com",
      phone: "555-123-4567",
      industry: "Technology",
      leadSource: "Website",
      leadScore: 85,
      lastContact: "2023-10-15"
    },
    {
      name: "Sarah Johnson",
      company: "Global Industries",
      email: "sarah.j@globalind.com",
      phone: "555-987-6543",
      industry: "Manufacturing",
      leadSource: "LinkedIn",
      leadScore: 72,
      lastContact: "2023-11-02"
    },
    {
      name: "Michael Chang",
      company: "Innovate Solutions",
      email: "mchang@innovatesol.com",
      phone: "555-111-2222",
      industry: "Technology",
      leadSource: "Referral",
      leadScore: 90,
      lastContact: "2023-11-10"
    },
    {
      name: "Emily Davis",
      company: "Summit Healthcare",
      email: "e.davis@summithc.org",
      phone: "555-444-5555",
      industry: "Healthcare",
      leadSource: "Trade Show",
      leadScore: 68,
      lastContact: "2023-10-28"
    },
    {
      name: "Robert Wilson",
      company: "Urban Financial",
      email: "rwilson@urbanfin.com",
      phone: "555-777-8888",
      industry: "Finance",
      leadSource: "Webinar",
      leadScore: 76,
      lastContact: "2023-11-05"
    }
  ];
}