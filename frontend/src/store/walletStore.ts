import { ethers } from 'ethers';
import { create } from 'zustand';

interface WalletState {
  account: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  setAccount: (account: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
  disconnect: () => void;
}

const useWalletStore = create<WalletState>((set, get) => ({
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  setAccount: (account) => set({ account }),
  setChainId: (chainId) => set({ chainId }),
  setProvider: (provider) => set({ provider }),
  setSigner: (signer) => set({ signer }),
  disconnect: () => {
    // Also remove listeners if they were set up by the store or a component that uses the store
    // For now, just resetting state. Listeners are handled in WalletConnector.
    const { provider } = get();
    if (provider && provider.provider && typeof (provider.provider as any).removeAllListeners === 'function') {
        // This is a generic attempt to remove listeners if the EIP-1193 provider supports it.
        // Specific listeners like 'accountsChanged' are usually managed by the component that adds them.
        // (provider.provider as any).removeAllListeners(); // Potentially too broad, better to manage specifics
    }
    set({ account: null, chainId: null, provider: null, signer: null });
    console.log("Wallet disconnected and state reset.");
  },
}));

export default useWalletStore;
