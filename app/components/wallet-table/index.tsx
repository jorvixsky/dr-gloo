import * as React from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { fetchTokenBalances } from "~/lib/api"
import type { WalletData } from "./columns"
import { CollectTokensModal } from "~/components/collect-tokens-modal"
import type { RowSelectionState } from "@tanstack/react-table"

interface WalletTableProps {
  connectedAddresses?: readonly string[]
}

export function WalletTable({ connectedAddresses = [] }: WalletTableProps) {
  const [walletData, setWalletData] = React.useState<WalletData[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [collectAmounts, setCollectAmounts] = React.useState<Record<string, number>>({})

  // Calculate the total value to collect
  const totalValueToCollect = React.useMemo(() => {
    let total = 0;
    
    Object.entries(rowSelection).forEach(([rowId, isSelected]) => {
      if (isSelected && walletData[parseInt(rowId)]) {
        const row = walletData[parseInt(rowId)];
        const amount = collectAmounts[rowId] !== undefined ? collectAmounts[rowId] : row.amount;
        // Calculate the USD value based on the proportion of tokens being collected
        const proportion = amount / row.amount;
        total += row.amountInUsd * proportion;
      }
    });
    
    return total;
  }, [walletData, rowSelection, collectAmounts]);

  // Listen for amount to collect changes
  React.useEffect(() => {
    const handleAmountChange = (event: Event) => {
      const customEvent = event as CustomEvent<{rowId: string, value: number}>;
      const { rowId, value } = customEvent.detail;
      
      setCollectAmounts(prev => ({
        ...prev,
        [rowId]: value
      }));
    };
    
    document.addEventListener('amountToCollectChange', handleAmountChange as EventListener);
    
    return () => {
      document.removeEventListener('amountToCollectChange', handleAmountChange as EventListener);
    };
  }, []);

  // Initialize collect amounts when rows are selected
  React.useEffect(() => {
    const newCollectAmounts: Record<string, number> = {};
    
    Object.entries(rowSelection).forEach(([rowId, isSelected]) => {
      if (isSelected && walletData[parseInt(rowId)]) {
        // If not already set, initialize with max amount
        if (collectAmounts[rowId] === undefined) {
          newCollectAmounts[rowId] = walletData[parseInt(rowId)].amount;
        } else {
          newCollectAmounts[rowId] = collectAmounts[rowId];
        }
      }
    });
    
    setCollectAmounts(prev => ({
      ...newCollectAmounts,
      ...prev
    }));
  }, [rowSelection, walletData]);

  // Fetch token balances when component mounts or when connectedAddresses changes
  React.useEffect(() => {
    async function loadTokenBalances() {
      if (connectedAddresses.length === 0) {
        // If no addresses provided, use empty array
        setWalletData([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Convert readonly string[] to string[]
        const addresses = Array.from(connectedAddresses)
        const networks = ['eth-mainnet', 'base-mainnet', 'matic-mainnet', 'arb-mainnet', 'opt-mainnet']
        
        console.log(`Fetching token balances for ${addresses.length} addresses across ${networks.length} networks...`)
        const data = await fetchTokenBalances(addresses, networks)
        console.log(`Received ${data.length} tokens from API`)
        
        if (data.length > 0) {
          // Filter out any entries with zero or very small balances and ensure they have monetary value
          const filteredData = data.filter(item => 
            item.amount > 0.000001 && item.amountInUsd > 0
          )
          console.log(`After filtering, ${filteredData.length} tokens remain with non-zero balances and monetary value`)
          setWalletData(filteredData)
        } else {
          console.log("No tokens returned from API, using empty array")
          // If no data returned, set empty array
          setWalletData([])
        }
      } catch (err) {
        console.error("Failed to fetch token balances:", err)
        setError("Failed to load token balances.")
        setWalletData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTokenBalances()
  }, [connectedAddresses])

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="mb-2 text-muted-foreground">No tokens found</p>
      <p className="text-sm text-muted-foreground">
        {connectedAddresses.length > 0 
          ? "Connect a wallet with tokens or try a different address" 
          : "Connect a wallet to see your tokens"}
      </p>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 text-red-700 rounded-md bg-red-50">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      ) : (
        <>
          {walletData.length > 0 ? (
            <>
              <DataTable 
                columns={columns} 
                data={walletData} 
                connectedAddresses={connectedAddresses}
                onRowSelectionChange={setRowSelection}
              />
              <div className="flex justify-center mt-6">
                <CollectTokensModal 
                  walletData={walletData} 
                  rowSelection={rowSelection}
                  selectedRows={Object.keys(rowSelection).length}
                  collectAmounts={collectAmounts}
                  totalValueToCollect={totalValueToCollect}
                />
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </>
      )}
    </div>
  )
} 