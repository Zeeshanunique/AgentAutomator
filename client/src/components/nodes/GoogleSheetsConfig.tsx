import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validateSheetId, parseCSVData, SpreadsheetRow, fetchSheetData, GoogleSheetsConfig } from '@/lib/googleSheetsAPI';
import { useToast } from '@/hooks/use-toast';

interface GoogleSheetsConfigProps {
  nodeId: string;
  initialData: {
    sheetId?: string;
    range?: string;
    authentication?: string;
    refreshInterval?: string;
  };
  onUpdate: (data: Record<string, any>) => void;
}

export default function GoogleSheetsConfigPanel({
  nodeId,
  initialData,
  onUpdate
}: GoogleSheetsConfigProps) {
  const { toast } = useToast();
  const [configMode, setConfigMode] = useState<'url' | 'csv'>('url');
  const [sheetUrl, setSheetUrl] = useState(initialData.sheetId || '');
  const [range, setRange] = useState(initialData.range || 'A1:Z1000');
  const [csvData, setCsvData] = useState('');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [authentication, setAuthentication] = useState(initialData.authentication || 'apiKey');
  const [refreshInterval, setRefreshInterval] = useState(initialData.refreshInterval || 'hourly');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [previewData, setPreviewData] = useState<SpreadsheetRow[]>([]);
  
  // Function to test the connection and fetch preview data
  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      
      let data: SpreadsheetRow[] = [];
      if (configMode === 'url') {
        // Validate Google Sheet ID
        const sheetId = validateSheetId(sheetUrl);
        if (!sheetId) {
          toast({
            title: "Invalid Google Sheet URL or ID",
            description: "Please enter a valid Google Sheets URL or ID",
            variant: "destructive"
          });
          return;
        }
        
        // Fetch data from Google Sheets API
        const config: GoogleSheetsConfig = {
          sheetId,
          range,
          includeHeaders: hasHeaders,
          authType: authentication === 'oauth' ? 'oauth' : 'apiKey'
        };
        
        data = await fetchSheetData(config);
      } else if (configMode === 'csv') {
        // Parse CSV data
        if (!csvData.trim()) {
          toast({
            title: "Empty CSV data",
            description: "Please paste your CSV data",
            variant: "destructive"
          });
          return;
        }
        
        data = parseCSVData(csvData, hasHeaders);
      }
      
      // Display preview and update node data
      setPreviewData(data.slice(0, 3)); // Show first 3 rows as preview
      
      // Update the node data
      onUpdate({
        sheetId: configMode === 'url' ? validateSheetId(sheetUrl) : 'csv-data',
        range: configMode === 'url' ? range : '',
        authentication: configMode === 'url' ? authentication : 'none',
        refreshInterval,
        dataSource: configMode,
        hasHeaders
      });
      
      // Show success toast
      toast({
        title: "Connection Successful",
        description: `Successfully retrieved ${data.length} rows of data`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error testing Google Sheets connection:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Google Sheets",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant={configMode === 'url' ? 'default' : 'outline'} 
            onClick={() => setConfigMode('url')}
            size="sm"
          >
            Google Sheet URL
          </Button>
          <Button 
            variant={configMode === 'csv' ? 'default' : 'outline'} 
            onClick={() => setConfigMode('csv')}
            size="sm"
          >
            Paste CSV
          </Button>
        </div>
        
        {configMode === 'url' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheet URL or ID</Label>
              <Input
                id="sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-400">Paste a Google Sheets URL or just the ID portion</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="range">Cell Range</Label>
              <Input
                id="range"
                placeholder="A1:Z1000"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-400">Example: A1:Z1000 or Sheet1!A1:C10</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auth-type">Authentication Method</Label>
              <Select value={authentication} onValueChange={setAuthentication}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select authentication method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apiKey">API Key</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="csv-data">Paste CSV Data</Label>
              <Textarea
                id="csv-data"
                placeholder="Paste your CSV data here..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="min-h-[200px] bg-gray-800 border-gray-700"
              />
            </div>
          </>
        )}
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="has-headers" 
            checked={hasHeaders}
            onCheckedChange={setHasHeaders}
          />
          <Label htmlFor="has-headers">First row contains headers</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="refresh">Refresh Interval</Label>
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select refresh interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Only</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={testConnection} 
          disabled={isTestingConnection}
          className="w-full"
        >
          {isTestingConnection ? "Testing Connection..." : "Test Connection"}
        </Button>
      </div>
      
      {previewData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Data Preview</CardTitle>
            <CardDescription>First 3 rows from your data source</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 px-2">
            <div className="overflow-x-auto max-h-[200px] rounded border border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="px-2 py-1.5 text-left font-medium">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-700 last:border-0">
                      {Object.values(row).map((value, j) => (
                        <td key={j} className="px-2 py-1.5 truncate max-w-[150px]">
                          {value === null ? "—" : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}