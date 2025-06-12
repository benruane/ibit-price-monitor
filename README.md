# IBIT Price Monitor

This project is a background worker that monitors the IBIT price from Alpha Vantage and submits data to SEDA when the price changes by 0.5% or every 10 minutes.

## Running Locally

1. Install dependencies:
   ```sh
   bun install
   ```
2. Create a `.env` file with the following variables:
   - `ALPHA_VANTAGE_API_KEY`
   - `SEDA_MNEMONIC`
   - `SEDA_RPC_ENDPOINT`
   - `ORACLE_PROGRAM_ID`
3. Start the worker:
   ```sh
   bun index.ts
   ```

## Deploying to Fly.io

1. Install the [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/):
   ```sh
   curl -L https://fly.io/install.sh | sh
   ```
2. Authenticate:
   ```sh
   fly auth login
   ```
3. Launch the app:
   ```sh
   fly launch --no-deploy
   ```
4. Set environment variables on Fly.io (or use a secrets file):
   ```sh
   fly secrets set ALPHA_VANTAGE_API_KEY=... SEDA_MNEMONIC=... SEDA_RPC_ENDPOINT=... ORACLE_PROGRAM_ID=...
   ```
5. Deploy:
   ```sh
   fly deploy
   ```

The worker will run continuously and monitor the IBIT price as described.
