import WalletConnect from "@walletconnect/react-native";
import { IJsonRpcRequest } from "@walletconnect/types";

export interface IWalletConnectRequest {
  connector: WalletConnect[];
  payload: IJsonRpcRequest;
}

export interface IWalletConnectReduxState {
  loading: boolean;
  connectors: WalletConnect[];
  pending: WalletConnect[];
  requests: IWalletConnectRequest[];
  peerMeta: {
    description: "",
    url: "",
    icons: [],
    name: "",
    ssl: false
  };
  uri: string;
  connected: boolean,
  chainId: any,
  accounts: any,
  address: any,
  results: any,
  displayRequest: any,
  pendingRequest: any,
  messages: any
}

export const WALLETCONNECT_INIT_REQUEST = "WALLETCONNECT_INIT_REQUEST";
export const WALLETCONNECT_INIT_SUCCESS = "WALLETCONNECT_INIT_SUCCESS";
export const WALLETCONNECT_INIT_FAILURE = "WALLETCONNECT_INIT_FAILURE";

export const WALLETCONNECT_SESSION_REQUEST =
  "WALLETCONNECT_SESSION_REQUEST";

export const WALLETCONNECT_SESSION_APPROVAL =
  "WALLETCONNECT_SESSION_APPROVAL";

export const WALLETCONNECT_SESSION_REJECTION =
  "WALLETCONNECT_SESSION_REJECTION";

export const WALLETCONNECT_SESSION_DISCONNECTED =
  "WALLETCONNECT_SESSION_DISCONNECTED";

export const WALLETCONNECT_CALL_REQUEST = "WALLETCONNECT_CALL_REQUEST";

export const WALLETCONNECT_CALL_APPROVAL = "WALLETCONNECT_CALL_APPROVAL";

export const WALLETCONNECT_CALL_REJECTION =
  "WALLETCONNECT_CALL_REJECTION";
