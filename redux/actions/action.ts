import WalletConnect from "@walletconnect/react-native";
import {IWalletConnectRequest} from "../reducers/types";
import {
    WALLETCONNECT_SESSION_REQUEST,
    WALLETCONNECT_SESSION_REJECTION,
    WALLETCONNECT_SESSION_DISCONNECTED,
    WALLETCONNECT_SESSION_APPROVAL,
    WALLETCONNECT_CALL_REQUEST,
    WALLETCONNECT_CALL_REJECTION,
    WALLETCONNECT_INIT_FAILURE,
    WALLETCONNECT_INIT_SUCCESS,
    WALLETCONNECT_INIT_REQUEST,
    WALLETCONNECT_CALL_APPROVAL
} from '../reducers/types';
import {
    asyncStorageLoadSessions,
    asyncStorageSaveSession,
    asyncStorageDeleteSession
} from '../reducers/asyncStorage';

const getNativeOptions = async () => {
    // const language = DEVICE_LANGUAGE.replace(/[-_](\w?)+/gi, "").toLowerCase();
    // const token = await getFCMToken();
  
    const nativeOptions = {
      clientMeta: {
        description: "Unifyre walletConnect demo a pp",
        url: "https://walletconnect.org",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
        name: "WalletConnect",
        ssl: true
      }
      // push: {
      //   url: "https://push.walletconnect.org",
      //   type: "fcm",
      //   token: token,
      //   peerMeta: true,
      //   language: language
      // }
    };
  
    return nativeOptions;
  };
  
  export const walletConnectInit = () => async (dispatch: any) => {
    dispatch({ type: WALLETCONNECT_INIT_REQUEST });
    try {
      const sessions = await asyncStorageLoadSessions();
      const connectors = await Promise.all(
        Object.values(sessions).map(async session => {
          const nativeOptions = await getNativeOptions();
          new WalletConnect({ session }, nativeOptions);
        })
      );
      dispatch({ type: WALLETCONNECT_INIT_SUCCESS, payload: connectors });
    } catch (error) {
      console.error();
      dispatch({ type: WALLETCONNECT_INIT_FAILURE });
    }
  };
  
  export const walletConnectOnSessionRequest = (uri: string) => async (
    dispatch: any,
    getState: any
  ) => {
    const nativeOptions = await getNativeOptions();
  
    const connector = new WalletConnect({ uri }, nativeOptions);
    console.log('helloooo')
    connector.on("session_request", (error: any, payload: any) => {
      console.log('walletConnector.on("session_request")'); // tslint:disable-line
      if (error) {
        throw error;
      }
      
      const { pending } = getState().walletConnect;
  
      const { peerId, peerMeta } = payload.params[0];
      console.log(peerId,peerMeta)
      dispatch({
        type: WALLETCONNECT_SESSION_REQUEST,
        payload: [...pending, connector,peerMeta,peerId]
      });  
    });
  };
  
  export const walletConnectApproveSessionRequest = (
    peerId: string,
    response: { accounts: string[]; chainId: number }
  ) => (dispatch: any, getState: any) => {
    const { connectors, pending } = getState().walletConnect;
  
    let updatedConnectors = [...connectors];
    let updatedPending = [];
  
    pending.forEach((connector: WalletConnect) => {
      console.log(connector.peerId,peerId,response.accounts)
      if (connector.peerId === peerId) {
        connector.approveSession({
          accounts: response.accounts,
          chainId: response.chainId
        });
        asyncStorageSaveSession(connector.session);
        updatedConnectors.push(connector);
      } else {
        updatedPending.push(connector);
      }
    });
  
    dispatch({
      type: WALLETCONNECT_SESSION_APPROVAL,
      payload: {
        connectors: updatedConnectors,
        pending: updatedPending,
        connected: true
      }
    });
  
    dispatch(walletConnectSubscribeToEvents(peerId));
  };
  
  export const walletConnectRejectSessionRequest = (peerId: string) => (
    dispatch: any,
    getState: any
  ) => {
    const { pending } = getState().walletConnect;
  
    const connector = pending.filter(
      (pendingConnector: WalletConnect) => pendingConnector.peerId === peerId
    )[0];
  
    connector.rejectSession();
  
    const updatedPending = pending.filter(
      (connector: WalletConnect) => connector.peerId !== peerId
    );
  
    dispatch({
      type: WALLETCONNECT_SESSION_REJECTION,
      payload: updatedPending
    });
  };
  
  export const walletConnectKillSession = (peerId: string) => (
    dispatch: any,
    getState: any
  ) => {
    const updatedConnectors = getState().walletConnect.connectors.filter(
      (connector: WalletConnect) => {
        if (connector.peerId === peerId) {
          connector.killSession();
          asyncStorageDeleteSession(connector.session);
          return false;
        }
        return true;
      }
    );
    dispatch({
      type: WALLETCONNECT_SESSION_DISCONNECTED,
      payload: updatedConnectors
    });
  };
  
  export const walletConnectSubscribeToEvents = (peerId: string) => (
    dispatch: any,
    getState: any
  ) => {
    const connector = getState().walletConnect.connectors.filter(
      (connector: WalletConnect) => connector.peerId === peerId
    )[0];
  
    connector.on("call_request", (error: any, payload: any) => {
      if (error) {
        throw error;
      }
      const updatedRequests = [...getState().walletConnect.requests];
  
      const updatedconnector = getState().walletConnect.connectors.filter(
        (connector: WalletConnect) => connector.peerId === peerId
      )[0];
  
      updatedRequests.push({
        connector: updatedconnector,
        payload: payload
      });
  
      dispatch({
        type: WALLETCONNECT_CALL_REQUEST,
        payload: updatedRequests
      });
  
      const { peerMeta } = connector;  
    });
  
    connector.on("disconnect", (error: any, payload: any) => {
      if (error) {
        throw error;
      }
      const updatedConnectors = getState().walletConnect.connectors.filter(
        (connector: WalletConnect) => {
          if (connector.peerId === peerId) {
            asyncStorageDeleteSession(connector.session);
            return false;
          }
          return true;
        }
      );
      dispatch({
        type: WALLETCONNECT_SESSION_DISCONNECTED,
        payload: updatedConnectors
      });
    });
  };
  
  export const walletConnectApproveCallRequest = (
    peerId: string,
    response: { id: number; result: any }
  ) => async (dispatch: any, getState: any) => {
    const connector = getState().walletConnect.connectors.filter(
      (connector: WalletConnect) => connector.peerId === peerId
    )[0];
  
    await connector.approveRequest(response);
  
    const updatedRequests = getState().walletConnect.connectors.filter(
      (request: IWalletConnectRequest) => request.payload.id !== response.id
    );
  
    await dispatch({
      type: WALLETCONNECT_CALL_APPROVAL,
      payload: updatedRequests
    });
  };
  
  export const walletConnectRejectCallRequest = (
    peerId: string,
    response: { id: number; error: { message: string } }
  ) => async (dispatch: any, getState: any) => {
    const connector = getState().walletConnect.connectors.filter(
      (connector: WalletConnect) => connector.peerId === peerId
    )[0];
  
    await connector.rejectRequest(response);
  
    const updatedRequests = getState().walletConnect.connectors.filter(
      (request: IWalletConnectRequest) => request.payload.id !== response.id
    );
  
    await dispatch({
      type: WALLETCONNECT_CALL_REJECTION,
      payload: updatedRequests
    });
  };
  