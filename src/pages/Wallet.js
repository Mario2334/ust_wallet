import React, {useEffect, useState} from 'react';
import {
    Box,
    chakra,
    Skeleton,
    Flex,
    Button,
    FormControl,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
    Textarea, Stat, StatLabel, StatNumber, Alert, AlertIcon
} from "@chakra-ui/react";
import { FaGoogleWallet } from "react-icons/fa";
import axios from "axios";
import {convertToInternationalCurrencySystem} from "../utils";
// import stream from "stream";
const CFaUserAlt = chakra(FaGoogleWallet);

// stream.Transform;

let getWalletDetails = async () => {
    let url = "https://backend.sayve.money/api/v1/token-sale-wallet/terra1elk88ssjcdhkzx3sx8tnux6dk6nsdspmf3fuat";
    let response = await axios.get(url);
    return response.data;
}


function Wallet() {
    let [state, setState] = useState({
        isInitialLoaded: false,
        loadButton: false,
        popoverShow:true,
        transaction_hash:null
    });

    let [walletDataState,setWalletDataState] = useState(
        {}
    );

    let getTotalDeposits = async () =>{
        let url = "https://bombay-lcd.terra.dev/wasm/contracts/terra1xvda8nmcqym3q7hdrmeuqsgneeddkv3gvhntlx/store?query_msg=%7B%22list%22:%7B%7D%7D";
        let response = await axios.get(url);
        let results = response.data.result.investors;
        let total_deposits = 0;
        for (let investors of results){
            total_deposits += investors.total;
        }
        return total_deposits;
    }

    let updateWalletDetails = async () =>{
        const mk = new window.Terra.MnemonicKey({
            mnemonic:'atom keep motion use unique pipe mix joy dismiss hybrid opinion soda guilt layer razor security tribe divorce express page slot tooth black address',
        });
        const terra_client = new window.Terra.LCDClient({
            URL: 'https://bombay-lcd.terra.dev',
            chainID: 'bombay-12'
        });
        const wallet = terra_client.wallet(mk);

        let data = await getWalletDetails();
        let total_deposits = await getTotalDeposits();
        let localWalletDataState = data.data.walletObj;
        localWalletDataState.total_deposits = convertToInternationalCurrencySystem(total_deposits);
        let newState = {...state,isInitialLoaded:true,wallet:wallet,terra:terra_client}
        setWalletDataState(localWalletDataState);
        setState(newState)
    }

    useEffect(() => {
        updateWalletDetails();
    },[]);

    let getInput = () => {
        let address_ele = document.getElementById("wallet_addr");
        let wallet_address = address_ele.value;
        let amount_ele = document.getElementById("set_amount");
        let set_amount = amount_ele.value;
        return {wallet_address,set_amount };
    }

    let depositExecution = async () => {
        let {wallet_address,set_amount} = getInput();
        const MILLION=1000000;
        const contract_address='terra1xvda8nmcqym3q7hdrmeuqsgneeddkv3gvhntlx';
        const calculated_dep = set_amount*MILLION;
        const msg = new window.Terra.MsgExecuteContract(
            state.wallet.key.accAddress,
            contract_address,
            {
                deposit: {}},
            new window.Terra.Coins({uusd: calculated_dep})
        );
        const tx = await state.wallet.createAndSignTx({ msgs: [msg] });
        const result = await state.terra.tx.broadcast(tx);
        console.log(result);
        let localState = state;
        localState.loadButton = false;
        localState.popoverShow = false;
        localState.transaction_hash = result.txhash;
        setState({...localState});
    }

    let claimExecution = async () => {
        let localState = state;
        const contract_address='terra1xvda8nmcqym3q7hdrmeuqsgneeddkv3gvhntlx'
        const msg = new window.Terra.MsgExecuteContract(
            state.wallet.key.accAddress,
            contract_address,
            {
                claim: {}
            }
        );
        const tx = await state.wallet.createAndSignTx({ msgs: [msg] });
        const result = await state.terra.tx.broadcast(tx);
        localState.loadButton = false;
        localState.popoverShow = false;
        localState.transaction_hash = result.txhash;
        setState({...localState});
    }

    let execute_deposit = (event) => {
        event.preventDefault();
        let localState = state;
        localState.loadButton = true;
        setState({...localState});
        depositExecution();
    }

    let execute_claim = (event) => {
        event.preventDefault();
        let localState = state;
        localState.loadButton = true;
        setState({...localState});
        claimExecution();
    }

    return (
        <>
        <Alert hidden={state.popoverShow} status='info'>
            <AlertIcon />
            The Transaction hash is {state.transaction_hash}
        </Alert>
        <Flex
            flexDirection="column"
            width="100wh"
            height="100vh"
            backgroundColor="gray.200"
            justifyContent="center"
            alignItems="center"
        >
            <Stack
                flexDir="column"
                mb="2"
                justifyContent="center"
                alignItems="center"
            >
                <Heading color="teal.400">Deposit</Heading>
                <Skeleton isLoaded={state.isInitialLoaded}>
                <Box minW={{ base: "90%", md: "500px"}}>
                    <Stack direction="row" spacing="234px">
                        <Stat>
                            <StatLabel color="teal.400">Mineral Grade</StatLabel>
                            <StatNumber color="teal.400">{walletDataState.mineral_grade}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel color="teal.400">Tier</StatLabel>
                            <StatNumber color="teal.400">{walletDataState.tier}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel color="teal.400">Allocation</StatLabel>
                            <StatNumber color="teal.400">{walletDataState.guaranteedAllocation}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel color="teal.400">Total Deposits</StatLabel>
                            <StatNumber color="teal.400">{walletDataState.total_deposits}</StatNumber>
                        </Stat>
                    </Stack>
                    <form>
                        <Stack
                        spacing={4}
                        p="1rem"
                        backgroundColor="whiteAlpha.900"
                        boxShadow="md"
                        >
                            <FormControl >
                                <InputGroup>

                                    <Textarea id="wallet_addr" type="text" placeholder="Nemonics" />
                                </InputGroup>

                            </FormControl>
                            <FormControl >
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaUserAlt color="gray.300" />}
                                    />
                                    <Input id="set_amount" type="number" placeholder="Wallet Amount" />
                                </InputGroup>

                            </FormControl>
                            <Stack direction={"row"}>
                                <Button
                                    borderRadius={0}
                                    isLoading={state.loadButton}
                                    loadingText='Depositing Amount'
                                    type="submit"
                                    variant="solid"
                                    colorScheme="teal"
                                    width="full"
                                    onClick={event => execute_deposit(event)}
                                >
                                    Deposit
                                </Button>
                                <Button
                                    borderRadius={0}
                                    isLoading={state.loadButton}
                                    loadingText='Claiming Amount'
                                    type="submit"
                                    variant="solid"
                                    colorScheme="teal"
                                    width="full"
                                    onClick={event => execute_claim(event)}
                                >
                                    Claim Amount
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Box>
                </Skeleton>
            </Stack>
        </Flex>
            </>
    )
}

export default Wallet;
