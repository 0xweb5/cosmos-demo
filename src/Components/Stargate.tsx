import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
	Account,
	Block,
	Coin,
	SequenceResponse,
	StargateClient,
} from "@cosmjs/stargate";
import React, { useEffect, useState } from "react";
import chain from "../config/osmosis";
import { useInterval } from "../Hooks/useInterval";

function Stargate() {
	const [mnemonic, setMnemonic] = useState<string>(localStorage.getItem("mnemonic"));
	const [address, setAddress] = useState<string>();
	const [balance, setBalance] = useState<Coin>();
	const [allBalance, setAllBalances] = useState<Coin[]>();
	const [client, setClient] = useState<any>();
	const [height, setHeight] = useState<number>();
	const [chainId, setChainId] = useState<string>();
	const [account, setAccount] = useState<Account>();
	const [block, setBlock] = useState<Block>();
	const [sequence, setSequence] = useState<SequenceResponse>();

	const [timestamp, setTimestamp] = useState(0);
	useInterval(() => setTimestamp(new Date().getTime()), 1000);

	// 连接
	useEffect(() => {
		if (!chain) return;
		connect();
	}, [chain]);

	useEffect(() => {
		if (!mnemonic) return;
		getAddressByMnemonic();
	}, [mnemonic]);

	// 余额查询
	useEffect(() => {
		if (!address || !client) return;
		getBalance();
	}, [timestamp, address, client]);

	// 实现stargate基础api
	useEffect(() => {
		if (!address || !client) return;
		getOthers();
	}, [address, client]);

	// 创建账户 Todo
	const createAccount = async () => {
		const _mnemonic: any = await DirectSecp256k1HdWallet.generate(12, { prefix: 'osmo' });
		localStorage.setItem('mnemonic', _mnemonic?.secret?.data);
		setMnemonic(_mnemonic?.secret?.data);
	};

	// 通过助记词钱包获得地址 Todo
	const getAddressByMnemonic = async () => {
		if (mnemonic) {
			const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'osmo' });
			const [{ address }] = await wallet.getAccounts();
			setAddress(address);
		}
	}

	// 余额查询 Todo
	const getBalance = async () => {
		const balance = await client?.getBalance(address, chain?.stakeCurrency?.coinMinimalDenom);
		setBalance(balance);
	};

	// strageClient 基础 api 使用 Todo
	const getOthers = async () => {
		const _height = await client?.getHeight();
		setHeight(_height);
		const _chainId = await client?.getChainId();
		setChainId(_chainId);
		const _account = await client?.getAccount(address);
		setAccount(_account);
		const _block = await client?.getBlock(_height);
		setBlock(_block);
		const _sequence = await client?.getSequence(address);
		setSequence(_sequence);
		const _allBalance = await client?.getAllBalances(address);
		setAllBalances(_allBalance);
	};

	// connect client Todo
	const connect = async () => {
		const client = await StargateClient.connect(chain?.rpc);
		setClient(client);
	};

	// disconnect client Todo
	const disConnect = async () => {
		const _client = await client?.disconnect();
		setClient(_client);

		setHeight(undefined);
		setChainId(undefined);
		setAccount(undefined);
		setBlock(undefined);
		setSequence(undefined);
		setAllBalances(undefined);
	};

	return (
		<div className="stargate">
			<h2>StargateClient</h2>
			<label>
				<span>Chain: Osmosis </span>
				<button onClick={client?.queryClient ? disConnect : connect}>
					{client?.queryClient ? "断开" : "连接"}
				</button>
			</label>
			<div className="weight">
				<span>
					助记词: &nbsp;
					<input
						type="text"
						value={mnemonic}
						placeholder="mnemonic"
						style={{ width: "400px" }}
						onChange={(e) => setMnemonic(e.target.value.trim())}
					/>
					<button onClick={createAccount}>创建账户</button>
				</span>
				&nbsp;&nbsp;
			</div>
			<div className="weight">
				<span style={{ whiteSpace: "nowrap" }}>余额: &nbsp;</span>
				{balance?.amount && (
					<>
						<span>
							{parseFloat(
								String(Number(balance?.amount) / Math.pow(10, 6))
							).toFixed(2)}
						</span>
						<span>{balance?.denom}</span>
					</>
				)}
			</div>
			<hr />
			<label>1、水龙头</label>
			<div>
				<span>
					Address: <b>{address}</b>
				</span>
				&nbsp;
				{address && (
					<a href="https://faucet.osmosis.zone/" target="_blank">
						获取
					</a>
				)}
			</div>
			<label>2、getChainId()</label>
			<div>
				<span>ChainId: {chainId} </span>
			</div>
			<label>3、getBalance()</label>
			<div>
				<span>Balance: </span>
				{balance?.amount && (
					<>
						<span>
							{parseFloat(
								String(Number(balance?.amount) / Math.pow(10, 6))
							).toFixed(2)}
						</span>
						<span> {balance?.denom}</span>
					</>
				)}
			</div>
			<label>4、getAccount()</label>
			<div>
				<div>address: {account?.address}</div>
				<div>accountNumber: {account?.accountNumber}</div>
				<div>sequence: {account?.sequence}</div>
			</div>

			<label>5、getHeight()</label>
			<div>Height: {height}</div>
			<label>6、getBlock()</label>
			<div>Blockhash:{block?.id}</div>
			<label>7、getAllBalances()</label>
			<div>
				{allBalance?.map((item) => {
					return (
						<div className="ell" key={item.denom}>
							{parseFloat(
								String(Number(item?.amount) / Math.pow(10, 6))
							).toFixed(2)}
							&nbsp;
							{item?.denom}
						</div>
					);
				})}
			</div>
			<label>8、getSequence()</label>
			<div>
				<div>accountNumber :{sequence?.accountNumber}</div>
				<div>sequence :{sequence?.sequence}</div>
			</div>
			{/* <label>9、getQueryClient()</label>
			<div>queryClient: {JSON.stringify(queryAccount?.toString())}</div> */}
		</div>
	);
}

export default Stargate;
