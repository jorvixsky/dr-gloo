import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import * as React from "react"
import { ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react"
import { formatAddress } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

// Define the data type for our table
export type WalletData = {
  id: string
  wallet: string
  token: string
  tokenName?: string // Full token name from the API
  tokenAddress?: string // Add tokenAddress to the type
  chain: string
  amount: number
  amountInUsd: number
  amountToCollect?: number // Amount to collect
}

// Function to get the appropriate block explorer URL for a token
function getExplorerUrl(chain: string, tokenAddress: string): string {
  // Default to etherscan for unknown networks
  let baseUrl = "https://etherscan.io";
  
  // Map chain names to their block explorer base URLs
  switch (chain) {
    case "Ethereum":
      baseUrl = "https://etherscan.io";
      break;
    case "Avalanche":
      baseUrl = "https://snowtrace.io";
      break;
    case "Base":
      baseUrl = "https://basescan.org";
      break;
    case "Polygon":
      baseUrl = "https://polygonscan.com";
      break;
    case "Arbitrum":
      baseUrl = "https://arbiscan.io";
      break;
    case "OP Mainnet":
      baseUrl = "https://optimistic.etherscan.io";
      break;
    case "Unichain":
      baseUrl = "https://uniscan.io";
      break;
    case "Linea":
      baseUrl = "https://lineascan.build";
      break;
  }
  
  return `${baseUrl}/token/${tokenAddress}`;
}

export const columns: ColumnDef<WalletData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "wallet",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-left"
      >
        Wallet
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium text-left">{formatAddress(row.getValue("wallet"))}</div>,
    filterFn: (row, id, value) => {
      const values = value as string[]
      if (values.length === 0) return true
      return values.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "token",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-left"
      >
        Token
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const tokenName = row.getValue("token") as string;
      const tokenAddress = row.original.tokenAddress;
      const chain = row.getValue("chain") as string;
      const fullTokenName = row.original.tokenName || tokenName;
      
      // If we don't have a token address, just show the token name
      if (!tokenAddress) {
        return <div className="text-left">{tokenName}</div>;
      }
      
      // Get the explorer URL for this token
      const explorerUrl = getExplorerUrl(chain, tokenAddress);
      
      return (
        <div className="text-left flex items-center gap-1">
          <span>{tokenName}</span>
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 inline-flex items-center"
            title={`${fullTokenName} - View on block explorer`}
          >
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const values = value as string[]
      if (values.length === 0) return true
      return values.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "chain",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-left"
      >
        Chain
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-left">{row.getValue("chain")}</div>,
    filterFn: (row, id, value) => {
      const values = value as string[]
      if (values.length === 0) return true
      return values.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const isSelected = row.getIsSelected();
      const inputRef = React.useRef<HTMLInputElement>(null);
      
      // Format with appropriate decimal places based on the value
      const formatAmount = (value: number) => {
        if (value >= 1000) {
          return value.toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        } else if (value >= 1) {
          return value.toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
          });
        } else {
          return value.toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          });
        }
      };
      
      // Format the amount for display in the input
      const formatAmountForInput = (value: number) => {
        if (value >= 1000) {
          return value.toFixed(2);
        } else if (value >= 1) {
          return value.toFixed(4);
        } else {
          return value.toFixed(6);
        }
      };
      
      // Set initial value when selected
      React.useEffect(() => {
        if (isSelected && inputRef.current) {
          inputRef.current.value = formatAmountForInput(amount);
        }
      }, [isSelected, amount]);
      
      // Handle click on the cell to select the row if not already selected
      const handleCellClick = () => {
        if (!isSelected) {
          row.toggleSelected(true);
        }
      };
      
      // Handle input change and validate range
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        let validatedValue = newValue;
        
        // Validate the range
        if (isNaN(newValue) || newValue < 0) {
          validatedValue = 0;
          if (inputRef.current) {
            inputRef.current.value = "0";
          }
        } else if (newValue > amount) {
          validatedValue = amount;
          if (inputRef.current) {
            inputRef.current.value = formatAmountForInput(amount);
          }
        }
        
        // Create a custom event to notify about the change
        const event = new CustomEvent('amountToCollectChange', {
          detail: {
            rowId: row.id,
            value: validatedValue
          }
        });
        document.dispatchEvent(event);
      };
      
      return (
        <div 
          className="text-right font-medium flex items-center justify-end gap-2"
          onClick={handleCellClick}
        >
          {isSelected ? (
            <>
              <Input
                ref={inputRef}
                type="number"
                defaultValue={formatAmountForInput(amount)}
                onChange={handleInputChange}
                className="w-20 h-8 text-right"
                min="0"
                max={amount.toString()}
                step="0.000001"
                // Stop propagation to prevent the cell click handler from firing
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-muted-foreground">/</span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground w-20 text-right">0</span>
              <span className="text-muted-foreground">/</span>
            </>
          )}
          <span>{formatAmount(amount)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "amountInUsd",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right"
        >
          Amount in USD
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountInUsd"))
      if (amount <= 0) {
        return <div className="text-right font-medium text-muted-foreground">-</div>
      }
      
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
      
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const wallet = row.original
      const addressToCopy = wallet.wallet

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(addressToCopy)}
              >
                Copy wallet address
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const tokenAddress = row.original.tokenAddress;
                  const chain = row.getValue("chain") as string;
                  if (tokenAddress) {
                    window.open(getExplorerUrl(chain, tokenAddress), "_blank");
                  }
                }}
              >
                View on explorer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
] 