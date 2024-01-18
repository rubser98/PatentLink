import Head from 'next/head'
import 'bulma/css/bulma.css'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import styles from '../styles/homeSale.module.css'
import vmContract from '../../blockchain/vending'
import Swal from 'sweetalert2';
const vendite = () => {

    const [error, setError] = useState('')
    const [totale, setTotale] = useState(0)
    const [conteggioPint, setConteggio] = useState('')
    const [buyCount, setBuyCount] = useState(0)
    const [etherCount, setEtherCount] = useState('')
    const [web3, setWeb3] = useState(null);
    const [etherSellCount, setSellEtherCount] = useState('')
    const [sellCount, setsellCount] = useState(0)
    const [isBottoneBuyAbilitato, setIsBottoneBuyAbilitato] = useState(false);
    const [isBottoneSellAbilitato, setIsBottoneSellAbilitato] = useState(false);


    useEffect(() => {

        getTotaleHandler()


    })

    const getMyCountPintHandler = async (web3) => {
        console.log(web3)
        const accounts = await web3.eth.getAccounts()
        console.log(accounts)
        console.log(accounts[0])
        var count = await vmContract.methods.balanceOf(accounts[0]).call()
        count = Number(count)
        count = count / Math.pow(10, 18).toFixed(0)
        console.log(count)
        setConteggio("this is your amount of pint : " + count)
    }

    const updatePintQty = event => {
        //function needed to save the amount of tokens written on the input form by the user (this value will be usefull in the buyPintHandler)
        setBuyCount((event.target.value * Math.pow(10, 12)).toFixed(0))
        setEtherCount(event.target.value)
        console.log((event.target.value * Math.pow(10, 12)).toFixed(0))


    }
    const updatePintQtySell = event => {
        //function needed to save the amount of tokens written on the input form by the user (this value will be usefull in the buyPintHandler)
        setsellCount((event.target.value * Math.pow(10, 12)).toFixed(0))
        setSellEtherCount(event.target.value)
        console.log((event.target.value * Math.pow(10, 12)).toFixed(0))

    }
    const sellPintHandler = async () => {
        console.log(web3)
        //web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()
        ethereum.enable()

        console.log(etherSellCount)
        console.log(sellCount)
        Swal.fire({
            title: 'Vuoi procedere?',
            text: 'Stai per vendere ' + etherSellCount + ' PNT al prezzo di ' + etherSellCount + ' ETH!',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sì, procedi!'
        })
            .then(async (result) => {
                if (result.isConfirmed) {
                    // Azione quando l'utente clicca su "Sì, procedi!"
                    try {

                        console.log(accounts[0])


                        await vmContract.methods.sellToken(sellCount).send({ from: accounts[0] })
                            .then(function (receipt) {
                                // Gestione del successo
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Operazione completata!',
                                    text: 'Transazione confermata. Hash della transazione: ' + receipt.transactionHash,
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                })
                                getMyCountPintHandler(web3)
                            })
                            .catch(function (error) {
                                // Gestione dell'errore
                                console.log(error)
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Operazione andata in errore!',
                                    text: 'Errore durante l\'invio della transazione: ' + (error.data === undefined ? error : error.data.message) + "\n: insert a lower number of token",
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                })
                            });

                    }
                    catch (err) {
                        console.log(err)
                        setError(err + "")
                    }

                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // Azione quando l'utente clicca su "Annulla"
                    Swal.fire('Annullato', 'La tua azione è stata annullata.', 'info');
                }
            });



    }


    const buyPintHandler = async () => {
        console.log(web3)
        //web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()
        console.log(buyCount)
        console.log(etherCount)
        try {

            console.log(accounts[0])
            const transactionObject = {
                from: accounts[0],
                to: "0xD883333fE492e5457959796e74140522A25cc839", //sepolia patent NFT : "0x663b027771c4c3e77d2AB35aE7eF44024C5C68B7",
                gas: '300000',  // Gas limit
                value: web3.utils.toWei(etherCount, "ether"),
                data: vmContract.methods.buyToken(Number(buyCount)).encodeABI(), // Includi il metodo e i suoi parametri
            };
            web3.eth.sendTransaction(transactionObject)
                .then(function (receipt) {
                    // Gestione del successo
                    Swal.fire({
                        icon: 'success',
                        title: 'Operazione completata!',
                        text: 'Transazione confermata. Hash della transazione: ' + receipt.transactionHash,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    })
                    getMyCountPintHandler(web3)

                })
                .catch(function (error) {
                    // Gestione dell'errore
                    console.log(error)
                    Swal.fire({
                        icon: 'error',
                        title: 'Operazione andata in errore!',
                        text: 'Errore durante l\'invio della transazione: ' + error.data.message,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    })
                });


        }
        catch (err) {
            console.log(err)
            setError(err + "")
        }


    }




    const getTotaleHandler = async () => {
        try {

            const totale2 = await vmContract.methods.totalSupply().call()

            setTotale((Number(totale2) / Math.pow(10, 18)).toFixed(0))

        }
        catch (e) {
            console.log(e)
        }

    }
    const connectWalletHandler = async () => {

        try {

            if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
                await window.ethereum.request({ method: "eth_requestAccounts" })
                var _web3 = new Web3(window.ethereum)
                setWeb3(_web3)
                getMyCountPintHandler(_web3)
                setIsBottoneBuyAbilitato(true)
                setIsBottoneSellAbilitato(true)

            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Operazione andata in errore!',
                    text: 'it is required to install metamask ' + error.data.message,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                })
            }
        }
        catch (e) {
            setError("l'utente ha rifiutato la connessione")
        }
    }
    return (
        <div className={styles.main}>
            <Head>
                <title>Sell app</title>
                <meta name="description" content="home" />
            </Head>

            <nav className="navbar mt-4 mb-4">
                <div className='container'>
                    <div className='navbar-brand'>
                        <h1>saleHome</h1>
                    </div>
                    <div className='navbar-end'>
                        <button
                            onClick={connectWalletHandler}
                            className='button is-primary'>connect wallet
                            
                        </button>

                    </div>

                </div>

            </nav>
            <section>
                <div className='container'>
                    <h2>totale supply pint: {totale}</h2>
                </div>
            </section>
            <section>
                <div className='container'>
                    <p> {conteggioPint}</p>
                </div>
            </section>
            <section className='mt-5'>
                <div className='container'>
                    <div className='field'>
                        <label className='label'> BUY PNT</label>
                        <div className='control'>
                            <input onChange={updatePintQty} className='input' type='type' placeholder='Enter amount...' />
                            <button
                                onClick={buyPintHandler}
                                className='button is-primary mt-3'
                                disabled={!isBottoneSellAbilitato} >
                                buy</button>


                        </div>

                    </div>
                </div>
            </section>
            <section className='mt-5'>
                <div className='container'>
                    <div className='field'>
                        <label className='label'> SELL PNT</label>
                        <div className='control'>
                            <input onChange={updatePintQtySell} className='input' type='type' placeholder='Enter amount...' />
                            <button
                                onClick={sellPintHandler}
                                disabled={!isBottoneBuyAbilitato}
                                className='button is-primary mt-3' >
                                sell</button>


                        </div>

                    </div>
                </div>
            </section>

            <section>
                <div className='container has-text-danger'>
                    <p>{error}</p>
                </div>
            </section>


        </div>
    )
}

export default vendite