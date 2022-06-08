import React from "react";
import { ethers } from "ethers";
import { getAccount } from "@wagmi/core";

export const BlockchainContext = React.createContext({
  currentAccount: null,
  provider: null,
  chainId: null
});

const BlockchainContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [provider, setProvider] = React.useState(null);

  const [chainId, setChainId] = React.useState(null);

  React.useEffect(() => {
    /*
     * 使用 window.ethereum 來透過 Matamask 來取得錢包地址
     * 參考資料: https://docs.metamask.io/guide/rpc-api.html
     * 並且將錢包地址設定在上方事先寫好的 currentAccount state
     * 加分項目1: 使用 window.ethereum 偵測換錢包地址事件，並且切換 currentAccount 值
     * 加分項目2: 使用 window.ethereum 偵測目前的鏈是否為 Rinkeby，如果不是，則透過 window.ethereum 跳出換鏈提示
     * 提示: Rinkeby chain ID 為 0x4
     */

    const updateCurrentAccounts = (accounts) => {
      const [_account] = accounts;
      setCurrentAccount(_account); // _account = "0x..."
    }

    window.ethereum
    ?.request({ method: "eth_requestAccounts" }) // ["0x...", ]
    .then(updateCurrentAccounts);


    // 加分項目1: 偵測換錢包地址事件
    const changeAccount = async () => {
      window.ethereum
        ?.request({ method: "eth_requestAccounts" })
        .then(updateCurrentAccounts);
      window.ethereum?.on("accountsChanged", updateCurrentAccounts);
    };

    changeAccount();

    // 加分項目2: 偵測目前的鏈是否為 Rinkeby，如果不是，則透過 window.ethereum 跳出換鏈提示
    const detectChain = async () => {
      const networkId = await window.ethereum?.networkVersion;
      console.log(networkId);

      if (networkId != "4") {
        window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4' }] })
        .then(res => alert("Switch chain to Rinkeby"))
        .catch(err => console.error(err))
      }
      else {
        setChainId('0x4');
      }
    };

    detectChain();
    
  }, []);

  React.useEffect(() => {
    /*
     * 使用 ethers.js
     * 透過 Web3Provider 將 window.ethereum 做為參數建立一個新的 web3 provider
     * 並將這個新的 web3 provider 設定成 provider 的 state
     */

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider)
  }, []);

  return (
    <BlockchainContext.Provider value={{ currentAccount, provider, chainId }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContextProvider;
