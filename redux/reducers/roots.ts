import { combineReducers } from 'redux';
import {
  IWalletConnectReduxState,
  WALLETCONNECT_INIT_REQUEST,
  WALLETCONNECT_INIT_SUCCESS,
  WALLETCONNECT_INIT_FAILURE,
  WALLETCONNECT_CALL_APPROVAL,
  WALLETCONNECT_CALL_REJECTION,
  WALLETCONNECT_CALL_REQUEST,
  WALLETCONNECT_SESSION_APPROVAL,
  WALLETCONNECT_SESSION_DISCONNECTED,
  WALLETCONNECT_SESSION_REJECTION,
  WALLETCONNECT_SESSION_REQUEST
} from './types';

const TEST_ACCOUNTS = ['0x2bb0A222473862Bd68Db6f3C97ea24F9A025F26f'];

const defaultChainId = 3;

const INITIAL_STATE: IWalletConnectReduxState = {
    loading: false,
    connectors: [],
    pending: [],
    requests: [],
    peerMeta: {
      description: "",
      url: "",
      icons: [],
      name: "",
      ssl: false
    },
    uri: "",
    connected: false,
    chainId: defaultChainId,
    accounts: TEST_ACCOUNTS,
    address: TEST_ACCOUNTS[0],
    results: [],
    displayRequest: null,
    pendingRequest: false,
    messages: []
  };
  
const walletConnect = (state = INITIAL_STATE,action: { type: string; payload: any }) => {
  
  console.log(action.type,'----->')   
  switch (action.type) {
      case WALLETCONNECT_INIT_REQUEST:
        return {
          ...state,
          loading: true
        };
      case WALLETCONNECT_INIT_SUCCESS:
        return {
          ...state,
          loading: false,
          connectors: action.payload
        };
      case WALLETCONNECT_INIT_FAILURE:
        return {
          ...state,
          loading: false
        };
      case WALLETCONNECT_SESSION_REQUEST:
      case WALLETCONNECT_SESSION_REJECTION:
        return {
          ...state,
          pending: action.payload,
          peerMeta: action.payload[1],
          peerId: action.payload[2]
        };
      case WALLETCONNECT_SESSION_APPROVAL:
        return {
          ...state,
          connectors: action.payload.connectors,
          pending: action.payload.pending,
          connected: action.payload.connected
        };
      case WALLETCONNECT_SESSION_DISCONNECTED:
        return {
          ...state,
          connectors: action.payload
        };
      case WALLETCONNECT_CALL_REQUEST:
      case WALLETCONNECT_CALL_APPROVAL:
      case WALLETCONNECT_CALL_REJECTION:
        return {
          ...state,
          requests: action.payload
        };
      default:
        return state;
    }
  };

export default combineReducers({
  walletConnect
});