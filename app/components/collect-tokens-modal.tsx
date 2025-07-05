import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select"
import type { WalletData } from "~/components/wallet-table/columns"

interface CollectTokensModalProps {
  walletData: WalletData[]
  rowSelection?: Record<string, boolean>
  selectedRows?: number
  collectAmounts?: Record<string, number>
  totalValueToCollect?: number
}

export function CollectTokensModal({ 
  walletData, 
  rowSelection = {}, 
  selectedRows = 0,
  collectAmounts = {},
  totalValueToCollect = 0
}: CollectTokensModalProps) {
  const [destinationWallet, setDestinationWallet] = React.useState("")
  const [destinationChain, setDestinationChain] = React.useState("")
  const [estimatedAmount, setEstimatedAmount] = React.useState(0)
  const [open, setOpen] = React.useState(false)

  // Calculate estimated USDC amount (with a 0.5% fee)
  React.useEffect(() => {
    const fee = 0.005 // 0.5%
    const estimatedWithFee = totalValueToCollect * (1 - fee)
    setEstimatedAmount(estimatedWithFee)
  }, [totalValueToCollect])

  // Available chains for destination
  const availableChains = [
    { id: "ethereum", name: "Ethereum" },
    { id: "polygon", name: "Polygon" },
    { id: "arbitrum", name: "Arbitrum" },
    { id: "optimism", name: "Optimism" },
    { id: "base", name: "Base" },
  ]

  // Calculate the total number of tokens and how many are being partially collected
  const tokenSummary = React.useMemo(() => {
    let totalTokens = 0;
    let partialTokens = 0;
    
    Object.entries(rowSelection).forEach(([rowId, isSelected]) => {
      if (isSelected && walletData[parseInt(rowId)]) {
        totalTokens++;
        const token = walletData[parseInt(rowId)];
        const amountToCollect = collectAmounts[rowId] || token.amount;
        
        // If collecting less than 99.9% of the token, consider it partial
        if (amountToCollect < token.amount * 0.999) {
          partialTokens++;
        }
      }
    });
    
    return { totalTokens, partialTokens };
  }, [rowSelection, walletData, collectAmounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would implement the actual transaction logic
    console.log("Collecting tokens to:", {
      destinationWallet,
      destinationToken: "USDC",
      destinationChain,
      estimatedAmount,
      collectAmounts
    })
    
    // Close the dialog after submission
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className={`text-lg font-semibold py-6 px-8 transition-all duration-200 ${selectedRows > 0 ? 'min-w-[240px]' : ''}`}
          disabled={selectedRows === 0}
        >
          {selectedRows === 0 ? (
            "Collect Tokens"
          ) : (
            <>
              Collect <span className="font-bold text-white">{totalValueToCollect.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">
            Collect {totalValueToCollect.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </DialogTitle>
          <DialogDescription>
            Convert {selectedRows} selected token{selectedRows !== 1 ? 's' : ''} to USDC and send to a destination wallet.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Token summary */}
          <div className="space-y-2 mb-2 bg-muted/50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Tokens to collect:</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {Object.entries(rowSelection)
                .filter(([rowId, isSelected]) => isSelected && walletData[parseInt(rowId)])
                .map(([rowId, isSelected]) => {
                  const token = walletData[parseInt(rowId)];
                  const amountToCollect = collectAmounts[rowId] || token.amount;
                  const proportion = amountToCollect / token.amount;
                  const valueToCollect = token.amountInUsd * proportion;
                  const percentageCollected = Math.round(proportion * 100);
                  
                  return (
                    <div key={rowId} className="flex justify-between text-xs">
                      <div className="flex flex-col">
                        <span>
                          {amountToCollect.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6
                          })} {token.token} ({token.chain})
                        </span>
                        {percentageCollected < 100 && (
                          <span className="text-xs text-muted-foreground">
                            {percentageCollected}% of total balance
                          </span>
                        )}
                      </div>
                      <span className="font-medium">
                        {valueToCollect.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="destination-wallet" className="text-sm font-medium">
              Destination Wallet
            </label>
            <Input
              id="destination-wallet"
              placeholder="0x..."
              value={destinationWallet}
              onChange={(e) => setDestinationWallet(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Destination Token
            </label>
            <Input
              value="USDC"
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="destination-chain" className="text-sm font-medium">
              Destination Chain
            </label>
            <Select
              value={destinationChain}
              onValueChange={setDestinationChain}
              required
            >
              <SelectTrigger id="destination-chain" className="w-full">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                {availableChains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 pt-3 border-t">
            <div className="flex justify-between mt-3">
              <span className="text-sm font-medium">Estimated USDC</span>
              <span className="text-sm font-semibold text-green-600">
                {estimatedAmount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Includes a 0.5% conversion fee
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full py-5 text-base">
              Send Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 