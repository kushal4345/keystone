import { contextBridge, ipcRenderer } from 'electron';
/**
 * Electron API exposed to the renderer process
 */
const electronAPI = {
    // Document processing
    processDocument: (filePath) => ipcRenderer.invoke('document:process', filePath),
    // Graph data
    fetchGraphData: (documentId) => ipcRenderer.invoke('graph:fetch', documentId),
    // LLM interactions
    askQuestion: (documentId, question) => ipcRenderer.invoke('llm:ask', documentId, question),
    // File dialog
    selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
    // Platform info
    platform: process.platform,
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
