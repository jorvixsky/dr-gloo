import * as React from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"

interface WalletTableProps {
  connectedAddresses?: readonly string[]
}

export function WalletTable({ connectedAddresses }: WalletTableProps) {
  // Use connected addresses if provided, otherwise use mock data
  const addresses = connectedAddresses || []
  
  // Generate wallet data based on connected addresses
  const walletData = React.useMemo(() => {
    
    // Create wallet data entries for each connected address
    return addresses.flatMap((address, index) => {
      
      // Create sample tokens for each address
      const tokens = [
        {
          id: `${index}-1`,
          wallet: address,
          token: "ETH",
          chain: "Ethereum",
          amount: 1.5,
          amountInUsd: 4500,
        },
        {
          id: `${index}-2`,
          wallet: address,
          token: "USDC",
          chain: "Ethereum",
          amount: 5000,
          amountInUsd: 5000,
        },
        {
          id: `${index}-3`,
          wallet: address,
          token: "MATIC",
          chain: "Polygon",
          amount: 10000,
          amountInUsd: 8000,
        }
      ]
      
      return tokens
    })
  }, [addresses])

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Wallet Assets</h2>
      <DataTable 
        columns={columns} 
        data={walletData} 
        connectedAddresses={addresses}
      />
    </div>
  )
} 