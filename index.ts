import axios from 'axios';
import { config } from 'dotenv';
import { SedaSDK } from '@seda-protocol/dev-tools';

// Load environment variables
config();

// Debug: Log all environment variables
console.log('Environment variables:');
console.log('ALPHA_VANTAGE_API_KEY:', process.env.ALPHA_VANTAGE_API_KEY ? 'Set' : 'Not set');
console.log('SEDA_RPC_ENDPOINT:', process.env.SEDA_RPC_ENDPOINT ? 'Set' : 'Not set');
console.log('SEDA_MNEMONIC:', process.env.SEDA_MNEMONIC ? 'Set' : 'Not set');
console.log('ORACLE_PROGRAM_ID:', process.env.ORACLE_PROGRAM_ID ? 'Set' : 'Not set');

// Configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const SEDA_RPC_ENDPOINT = process.env.SEDA_RPC_ENDPOINT;
const SEDA_MNEMONIC = process.env.SEDA_MNEMONIC;
const ORACLE_PROGRAM_ID = process.env.ORACLE_PROGRAM_ID;
const PRICE_CHANGE_THRESHOLD = 0.005; // 0.5%
const REGULAR_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Validate environment variables
if (!ALPHA_VANTAGE_API_KEY) throw new Error('ALPHA_VANTAGE_API_KEY is required');
if (!SEDA_RPC_ENDPOINT) throw new Error('SEDA_RPC_ENDPOINT is required');
if (!SEDA_MNEMONIC) throw new Error('SEDA_MNEMONIC is required');
if (!ORACLE_PROGRAM_ID) throw new Error('ORACLE_PROGRAM_ID is required');

// Initialize SEDA SDK
const seda = new SedaSDK({
    rpcEndpoint: SEDA_RPC_ENDPOINT,
    mnemonic: SEDA_MNEMONIC,
});

let lastReportedPrice: number | null = null;
let lastReportTime: number = 0;

async function fetchIBITPrice(): Promise<number> {
    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBIT&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        
        const price = parseFloat(response.data['Global Quote']['05. price']);
        if (isNaN(price)) {
            throw new Error('Invalid price data received');
        }
        
        return price;
    } catch (error) {
        console.error('Error fetching IBIT price:', error);
        throw error;
    }
}

async function submitDataRequest(price: number) {
    try {
        const result = await seda.oracleProgram.submitDataRequest({
            oracleProgramId: ORACLE_PROGRAM_ID,
            inputs: ALPHA_VANTAGE_API_KEY,
        });
        
        console.log(`Data request submitted for price ${price}. Transaction hash: ${result.txHash}`);
        lastReportedPrice = price;
        lastReportTime = Date.now();
    } catch (error) {
        console.error('Error submitting data request:', error);
    }
}

async function checkAndSubmitPrice() {
    try {
        const currentPrice = await fetchIBITPrice();
        const currentTime = Date.now();
        
        // Check if we should submit a new data request
        const shouldSubmit = 
            // First price report
            lastReportedPrice === null ||
            // Regular interval (10 minutes)
            currentTime - lastReportTime >= REGULAR_INTERVAL_MS ||
            // Price change threshold (0.5%)
            Math.abs(currentPrice - lastReportedPrice) / lastReportedPrice >= PRICE_CHANGE_THRESHOLD;
        
        if (shouldSubmit) {
            await submitDataRequest(currentPrice);
        } else {
            console.log(`Price ${currentPrice} within threshold, skipping data request`);
        }
    } catch (error) {
        console.error('Error in price check cycle:', error);
    }
}

// Start the monitoring service
console.log('Starting IBIT price monitor...');
checkAndSubmitPrice();

// Run price check every minute (Alpha Vantage free tier allows 5 calls per minute)
setInterval(checkAndSubmitPrice, 60 * 1000);