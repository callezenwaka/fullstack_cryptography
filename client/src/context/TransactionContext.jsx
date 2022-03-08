import React, { useEffect, useState } from 'react'
import axios from 'axios'
import jwt_decode from 'jwt-decode'

export const TransactionContext = React.createContext()

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({
    receiver: '',
    amount: '',
    message: '',
  })
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount'),
  )
  const [credential, setCredential] = useState('')
  const [address, setAddress] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState([])

  const request = async (url, method, token, data) => {
    const res = await axios({
      method: method,
      url: `${url}`,
      data: data,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  }

  const axiosJWT = axios.create()

  axiosJWT.interceptors.request.use(
    async (config) => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      let currentDate = new Date();
      const decodedToken = jwt_decode(accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refresh(refreshToken);
        // config.headers["content-type"] = "application/json";
        // config.headers["Accept"] = "application/json";
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }))
  }

  const handleCredential = (e) => {
    setCredential(e.target.value)
  }

  const handleLogout = async () => {
    await request(`${import.meta.env.VITE_BASE_URL}/logout`, 'post', accessToken, { refreshToken: refreshToken })
    localStorage.removeItem('address');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setAddress('');
    setAccessToken('');
    setRefreshToken('');
    window.location.reload();
  }

  const getAllTransactions = async () => {
    try {
      // TODO: Get all transactions
      // await checkToken();
      const address = localStorage.getItem('address')
      const accessToken = localStorage.getItem('accessToken')
      if (!address) return
      const data = await request(`${import.meta.env.VITE_BASE_URL}/crypto`, 'get', accessToken, '');
      // const {data} = await axiosJWT.get(`${import.meta.env.VITE_BASE_URL}/crypto`, {
      //   headers: {
      //     'content-type': 'application/json',
      //     Accept: 'application/json',
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // });
      setTransactions(data);
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnect = async () => {
    try {
      // TODO: Check wallet connection
      const address = localStorage.getItem('address');
      if (!address) return;

      setAddress(address);
      getAllTransactions();
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfTransactionsExists = async () => {
    try {
      // TODO: Check transaction
      const address = localStorage.getItem('address')
      const accessToken = localStorage.getItem('accessToken')
      if (!address) return

      const data = await request(`${import.meta.env.VITE_BASE_URL}/crypto/count`, 'get', accessToken, '')
      localStorage.setItem('transactionCount', data)
    } catch (error) {
      console.log(error)
    }
  }

  const checkToken = async () => {
    try {
      // TODO: Check token expiration
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const address = localStorage.getItem('address')
      if (accessToken != null && address != null && refreshToken != null) {
        const currentDate = new Date()
        const decodedToken = jwt_decode(accessToken)
        if (decodedToken.exp * 1000 < currentDate.getTime()) {
          refresh(refreshToken)
        } else {
          fetch()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      // TODO: Connect wallet
      if (!credential) return
      const data = await request(`${import.meta.env.VITE_BASE_URL}/login`, 'post', '', { credential: credential })

      if (typeof data != 'object') return
      localStorage.setItem('address', data.address)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      setAddress(data.address)
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken)

      window.location.reload()
    } catch (error) {
      console.log(error)
    }
  }

  const refresh = async (refreshToken) => {
    try {
      // TODO: Refresh token
      const data = await request(`${import.meta.env.VITE_BASE_URL}/refresh`, 'post', accessToken, { refreshToken: refreshToken }, )

      if (typeof data != 'object') return
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('address', data.address)

      setAddress(data.address)
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken)
    } catch (error) {
      console.log(error)
    }
  }

  const fetch = async () => {
    try {
      // TODO: Fetch token
      setAddress(localStorage.getItem('address'))
      setAccessToken(localStorage.getItem('accessToken'))
      setRefreshToken(localStorage.getItem('refreshToken'))
    } catch (error) {
      console.log(error)
    }
  }

  const sendTransaction = async () => {
    try {
      // TODO: Send transaction
      // await checkToken();
      const address = localStorage.getItem('address');
      if (!address) return;
      const { receiver, amount, message } = formData;
      setIsLoading(true);
      const data = await request( `${import.meta.env.VITE_BASE_URL}/crypto`, 'post', accessToken, {
        receiver: receiver,
        amount: amount,
        message: message,
      });
      console.log(data);
      setIsLoading(false);

      const count = await request(`${import.meta.env.VITE_BASE_URL}/crypto/count`, 'get', accessToken);
      setTransactionCount(count);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // checkToken();
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const address = localStorage.getItem('address')
    if (accessToken != null && address != null && refreshToken != null) {
      const currentDate = new Date()
      const decodedToken = jwt_decode(accessToken)
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        refresh(refreshToken)
      } else {
        fetch()
      }
    }
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        transactions,
        address,
        isLoading,
        formData,
        connectWallet,
        sendTransaction,
        handleCredential,
        handleChange,
        handleLogout,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
