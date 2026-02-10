import React, { useState, useEffect } from 'react';
import type { ProfileData } from '../types';

interface GoogleDriveSyncProps {
  profiles: Record<string, ProfileData>;
  onRestore: (data: Record<string, ProfileData>) => void;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // User needs their own or generic app
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'sm26_assistant_profiles.json';

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({ profiles, onRestore }) => {
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('sm26_last_sync'));

  useEffect(() => {
    const initGsi = () => {
      if (!window.google) return;
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse.error !== undefined) throw tokenResponse;
          setAccessToken(tokenResponse.access_token);
        },
      });
      setTokenClient(client);
    };

    const interval = setInterval(() => {
      if (window.google) {
        initGsi();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = () => {
    if (tokenClient) tokenClient.requestAccessToken({ prompt: 'consent' });
  };

  const syncToDrive = async () => {
    if (!accessToken) {
        handleAuth();
        return;
    }
    setIsSyncing(true);
    try {
      // 1. Search for existing file
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}'&spaces=drive`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const { files } = await searchRes.json();
      const existingFile = files?.[0];

      const metadata = { name: FILE_NAME, mimeType: 'application/json' };
      const content = JSON.stringify(profiles);
      const blob = new Blob([content], { type: 'application/json' });

      let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (existingFile) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
        method = 'PATCH';
      }

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });

      if (res.ok) {
        const now = new Date().toLocaleString();
        setLastSync(now);
        localStorage.setItem('sm26_last_sync', now);
        alert('Data backed up to Drive!');
      }
    } catch (e) {
      console.error(e);
      alert('Sync failed. Check console.');
    } finally {
      setIsSyncing(false);
    }
  };

  const restoreFromDrive = async () => {
    if (!accessToken) {
        handleAuth();
        return;
    }
    setIsSyncing(true);
    try {
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}'&spaces=drive`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const { files } = await searchRes.json();
      if (!files || files.length === 0) {
        alert('No backup found on Drive.');
        return;
      }
      
      const fileId = files[0].id;
      const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await downloadRes.json();
      onRestore(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button 
          onClick={syncToDrive} 
          disabled={isSyncing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center justify-center gap-2"
        >
          {isSyncing ? '...' : <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg> Sync to Drive</>}
        </button>
        <button 
          onClick={restoreFromDrive} 
          disabled={isSyncing}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center justify-center gap-2"
        >
           {isSyncing ? '...' : <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg> Restore</>}
        </button>
      </div>
      {lastSync && <p className="text-[10px] text-gray-400 text-center">Last synced: {lastSync}</p>}
    </div>
  );
};