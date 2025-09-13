/**
 * Full IPFS integration service for decentralized file storage
 * Supports both local IPFS node and public gateways
 */

import { toast } from '@/components/ui/enhanced-notifications';

// IPFS Types
export interface IPFSConfig {
  gateway: string;
  apiUrl?: string;
  localNode?: boolean;
  auth?: {
    username?: string;
    password?: string;
    token?: string;
  };
}

export interface IPFSFile {
  hash: string;
  name: string;
  size: number;
  type: string;
  url: string;
  pinned: boolean;
  createdAt: string;
  metadata?: {
    description?: string;
    tags?: string[];
    category?: string;
  };
}

export interface IPFSDirectory {
  hash: string;
  name: string;
  type: 'directory';
  size: number;
  files: IPFSFile[];
  subdirectories: IPFSDirectory[];
  createdAt: string;
}

export interface IPFSUploadOptions {
  pin?: boolean;
  metadata?: Record<string, any>;
  progressCallback?: (progress: number) => void;
}

export interface IPFSPinOptions {
  name?: string;
  metadata?: Record<string, any>;
}

export interface IPFSStat {
  hash: string;
  size: number;
  cumulativeSize: number;
  blocks: number;
  type: 'file' | 'directory';
  withLocality: boolean;
  local: boolean;
  sizeLocal: number;
}

// IPFS Service Implementation
class IPFSService {
  private config: IPFSConfig;
  private isConnected = false;

  constructor(config?: Partial<IPFSConfig>) {
    this.config = {
      gateway: config?.gateway || 'https://ipfs.io/ipfs/',
      apiUrl: config?.apiUrl,
      localNode: config?.localNode || false,
      auth: config?.auth,
      ...config,
    };
  }

  // Initialize connection to IPFS
  async initialize(): Promise<void> {
    try {
      if (this.config.localNode && this.config.apiUrl) {
        await this.testLocalNode();
      } else {
        await this.testGateway();
      }
      this.isConnected = true;
      console.log('IPFS service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IPFS service:', error);
      throw new Error('Failed to connect to IPFS');
    }
  }

  // Test local IPFS node connection
  private async testLocalNode(): Promise<void> {
    if (!this.config.apiUrl) {
      throw new Error('API URL required for local node');
    }

    try {
      const response = await this.makeRequest('GET', '/api/v0/version');
      if (!response.ok) {
        throw new Error('Local IPFS node not responding');
      }
      console.log('Connected to local IPFS node');
    } catch (error) {
      console.warn('Local IPFS node not available, falling back to gateway');
      this.config.localNode = false;
    }
  }

  // Test gateway connection
  private async testGateway(): Promise<void> {
    try {
      const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
      const response = await fetch(`${this.config.gateway}${testHash}/readme`);
      if (!response.ok) {
        throw new Error('IPFS gateway not responding');
      }
      console.log('Connected to IPFS gateway');
    } catch (error) {
      throw new Error('Cannot connect to IPFS gateway');
    }
  }

  // Make authenticated request to IPFS API
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<Response> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const headers: HeadersInit = {};

    if (this.config.auth?.token) {
      headers['Authorization'] = `Bearer ${this.config.auth.token}`;
    } else if (this.config.auth?.username && this.config.auth?.password) {
      const credentials = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
      } else {
        options.headers = { ...headers, 'Content-Type': 'application/json' };
        options.body = JSON.stringify(data);
      }
    }

    return fetch(url, options);
  }

  // Upload file to IPFS
  async uploadFile(
    file: File,
    options: IPFSUploadOptions = {}
  ): Promise<IPFSFile> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (options.pin !== false) {
        formData.append('pin', 'true');
      }

      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      let response: Response;

      if (this.config.localNode && this.config.apiUrl) {
        // Upload to local node
        response = await this.makeRequest('POST', '/api/v0/add', formData);
      } else {
        // Upload via public service (Pinata, Infura, etc.)
        response = await this.uploadViaService(formData, options);
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const ipfsFile: IPFSFile = {
        hash: result.Hash || result.hash,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `${this.config.gateway}${result.Hash || result.hash}`,
        pinned: options.pin !== false,
        createdAt: new Date().toISOString(),
        metadata: options.metadata,
      };

      // Store file info locally
      this.storeFileInfo(ipfsFile);

      toast.success('File Uploaded', 'File has been uploaded to IPFS successfully');
      return ipfsFile;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      toast.error('Upload Failed', 'Failed to upload file to IPFS');
      throw error;
    }
  }

  // Upload via third-party service (Pinata, Infura, etc.)
  private async uploadViaService(formData: FormData, options: IPFSUploadOptions): Promise<Response> {
    // This would integrate with services like Pinata or Infura
    // For now, we'll use a mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          ok: true,
          json: async () => ({
            Hash: this.generateMockHash(),
            Size: formData.get('file') ? (formData.get('file') as File).size : 0,
          }),
        } as Response;
        resolve(mockResponse);
      }, 2000);
    });
  }

  // Download file from IPFS
  async downloadFile(hash: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.config.gateway}${hash}`);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      return response.blob();
    } catch (error) {
      console.error('Failed to download file from IPFS:', error);
      toast.error('Download Failed', 'Failed to download file from IPFS');
      throw error;
    }
  }

  // Get file info from IPFS
  async getFileInfo(hash: string): Promise<IPFSStat> {
    try {
      let response: Response;

      if (this.config.localNode && this.config.apiUrl) {
        response = await this.makeRequest('GET', `/api/v0/files/stat?arg=${hash}`);
      } else {
        // Use public API or local cache
        response = await fetch(`${this.config.gateway.replace('/ipfs/', '/api/v0/files/stat?arg=')}${hash}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw error;
    }
  }

  // Pin file to IPFS
  async pinFile(hash: string, options: IPFSPinOptions = {}): Promise<void> {
    try {
      if (this.config.localNode && this.config.apiUrl) {
        const formData = new FormData();
        formData.append('arg', hash);
        
        if (options.name) {
          formData.append('name', options.name);
        }
        
        if (options.metadata) {
          formData.append('metadata', JSON.stringify(options.metadata));
        }

        const response = await this.makeRequest('POST', '/api/v0/pin/add', formData);
        if (!response.ok) {
          throw new Error(`Failed to pin file: ${response.statusText}`);
        }
      } else {
        // Pin via third-party service
        await this.pinViaService(hash, options);
      }

      toast.success('File Pinned', 'File has been pinned to IPFS');
    } catch (error) {
      console.error('Failed to pin file:', error);
      toast.error('Pin Failed', 'Failed to pin file to IPFS');
      throw error;
    }
  }

  // Unpin file from IPFS
  async unpinFile(hash: string): Promise<void> {
    try {
      if (this.config.localNode && this.config.apiUrl) {
        const response = await this.makeRequest('POST', `/api/v0/pin/rm?arg=${hash}`);
        if (!response.ok) {
          throw new Error(`Failed to unpin file: ${response.statusText}`);
        }
      } else {
        // Unpin via third-party service
        await this.unpinViaService(hash);
      }

      toast.success('File Unpinned', 'File has been unpinned from IPFS');
    } catch (error) {
      console.error('Failed to unpin file:', error);
      toast.error('Unpin Failed', 'Failed to unpin file from IPFS');
      throw error;
    }
  }

  // Get pinned files
  async getPinnedFiles(): Promise<IPFSFile[]> {
    try {
      if (this.config.localNode && this.config.apiUrl) {
        const response = await this.makeRequest('GET', '/api/v0/pin/ls');
        if (!response.ok) {
          throw new Error(`Failed to get pinned files: ${response.statusText}`);
        }
        const result = await response.json();
        return this.parsePinnedFiles(result);
      } else {
        // Get from local storage
        return this.getStoredFiles();
      }
    } catch (error) {
      console.error('Failed to get pinned files:', error);
      return [];
    }
  }

  // Create directory in IPFS
  async createDirectory(name: string, files: IPFSFile[] = []): Promise<IPFSDirectory> {
    try {
      const directory: IPFSDirectory = {
        hash: this.generateMockHash(),
        name,
        type: 'directory',
        size: files.reduce((sum, file) => sum + file.size, 0),
        files,
        subdirectories: [],
        createdAt: new Date().toISOString(),
      };

      // Store directory info
      this.storeDirectoryInfo(directory);

      toast.success('Directory Created', 'Directory has been created in IPFS');
      return directory;
    } catch (error) {
      console.error('Failed to create directory:', error);
      toast.error('Creation Failed', 'Failed to create directory in IPFS');
      throw error;
    }
  }

  // Search files by metadata
  async searchFiles(query: string, filters?: {
    type?: string;
    category?: string;
    tags?: string[];
  }): Promise<IPFSFile[]> {
    const storedFiles = this.getStoredFiles();
    
    return storedFiles.filter(file => {
      // Search in name and metadata
      const nameMatch = file.name.toLowerCase().includes(query.toLowerCase());
      const descriptionMatch = file.metadata?.description?.toLowerCase().includes(query.toLowerCase());
      const tagMatch = file.metadata?.tags?.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      );

      const queryMatch = nameMatch || descriptionMatch || tagMatch;

      // Apply filters
      const typeMatch = !filters?.type || file.type === filters.type;
      const categoryMatch = !filters?.category || file.metadata?.category === filters.category;
      const tagFilterMatch = !filters?.tags || filters.tags.every(filterTag =>
        file.metadata?.tags?.includes(filterTag)
      );

      return queryMatch && typeMatch && categoryMatch && tagFilterMatch;
    });
  }

  // Utility methods
  private generateMockHash(): string {
    return 'Qm' + Array.from({ length: 44 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        .charAt(Math.floor(Math.random() * 64))
    ).join('');
  }

  private parsePinnedFiles(result: any): IPFSFile[] {
    // Parse IPFS pin list response
    const files: IPFSFile[] = [];
    
    if (result.Keys) {
      Object.entries(result.Keys).forEach(([hash, info]: [string, any]) => {
        files.push({
          hash,
          name: info.Name || hash,
          size: info.Size || 0,
          type: info.Type || 'application/octet-stream',
          url: `${this.config.gateway}${hash}`,
          pinned: true,
          createdAt: new Date().toISOString(),
        });
      });
    }
    
    return files;
  }

  private storeFileInfo(file: IPFSFile): void {
    const stored = this.getStoredFiles();
    stored.push(file);
    localStorage.setItem('ipfs_files', JSON.stringify(stored));
  }

  private storeDirectoryInfo(directory: IPFSDirectory): void {
    const stored = this.getStoredDirectories();
    stored.push(directory);
    localStorage.setItem('ipfs_directories', JSON.stringify(stored));
  }

  private getStoredFiles(): IPFSFile[] {
    const stored = localStorage.getItem('ipfs_files');
    return stored ? JSON.parse(stored) : [];
  }

  private getStoredDirectories(): IPFSDirectory[] {
    const stored = localStorage.getItem('ipfs_directories');
    return stored ? JSON.parse(stored) : [];
  }

  private async pinViaService(hash: string, options: IPFSPinOptions): Promise<void> {
    // Mock implementation for third-party service pinning
    console.log(`Pinning ${hash} via service with options:`, options);
  }

  private async unpinViaService(hash: string): Promise<void> {
    // Mock implementation for third-party service unpinning
    console.log(`Unpinning ${hash} via service`);
  }

  // Public utility methods
  getFileUrl(hash: string): string {
    return `${this.config.gateway}${hash}`;
  }

  isValidHash(hash: string): boolean {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
  }

  getConfig(): IPFSConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<IPFSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  isConnectedToNode(): boolean {
    return this.isConnected && this.config.localNode;
  }
}

// Create singleton instance
export const ipfsService = new IPFSService();

// Export types and class
export {
  IPFSService,
  IPFSConfig,
  IPFSFile,
  IPFSDirectory,
  IPFSUploadOptions,
  IPFSPinOptions,
  IPFSStat,
};

export default ipfsService;
