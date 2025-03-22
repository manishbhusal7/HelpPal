import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AccountsProps {
  userId: number | undefined;
}

export default function Accounts({ userId }: AccountsProps) {
  const { toast } = useToast();
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    name: "",
    balance: 0,
    limit: 0
  });
  
  const { data: creditCards, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/credit-cards`],
    enabled: !!userId
  });
  
  const addCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      return apiRequest('POST', `/api/users/${userId}/credit-cards`, cardData);
    },
    onSuccess: () => {
      toast({
        title: "Card Added",
        description: "Your credit card has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/credit-cards`] });
      setIsAddCardDialogOpen(false);
      setNewCard({ name: "", balance: 0, limit: 0 });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add credit card.",
        variant: "destructive"
      });
    }
  });
  
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, balance, limit }: { id: number, balance: number, limit: number }) => {
      return apiRequest('PUT', `/api/credit-cards/${id}`, { balance, limit });
    },
    onSuccess: () => {
      toast({
        title: "Card Updated",
        description: "Your credit card has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/credit-cards`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update credit card.",
        variant: "destructive"
      });
    }
  });
  
  const handleAddCard = () => {
    if (!userId) return;
    
    // Validate inputs
    if (!newCard.name || newCard.balance < 0 || newCard.limit <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill out all fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    const utilization = (newCard.balance / newCard.limit) * 100;
    
    addCardMutation.mutate({
      userId,
      name: newCard.name,
      balance: newCard.balance,
      limit: newCard.limit,
      utilization,
      isConnected: true
    });
  };
  
  const getUtilizationColor = (utilization: number) => {
    if (utilization > 50) return "text-warning-500";
    if (utilization > 30) return "text-accent-500";
    return "text-success-500";
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Accounts</h2>
          <p className="text-sm text-neutral-500">Please wait...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Your Accounts</h1>
        <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Credit Card</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Credit Card</DialogTitle>
              <DialogDescription>
                Enter your credit card details to track its utilization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Name</label>
                <Input 
                  value={newCard.name}
                  onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                  placeholder="e.g. Chase Sapphire"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Balance</label>
                <Input 
                  type="number"
                  value={newCard.balance}
                  onChange={(e) => setNewCard({...newCard, balance: parseFloat(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Credit Limit</label>
                <Input 
                  type="number"
                  value={newCard.limit}
                  onChange={(e) => setNewCard({...newCard, limit: parseFloat(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCardDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCard} disabled={addCardMutation.isPending}>
                {addCardMutation.isPending ? "Adding..." : "Add Card"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="credit-cards">
        <TabsList className="mb-4">
          <TabsTrigger value="credit-cards">Credit Cards</TabsTrigger>
          <TabsTrigger value="loans" disabled>Loans</TabsTrigger>
          <TabsTrigger value="bank-accounts" disabled>Bank Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="credit-cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creditCards && creditCards.map((card: any) => (
              <Card key={card.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <span className="material-icons text-neutral-400">credit_card</span>
                  </div>
                  <CardDescription>Credit Card</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-neutral-500">Current Balance</div>
                    <div className="text-xl font-semibold">{formatCurrency(card.balance)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500">Credit Limit</div>
                    <div className="text-xl font-semibold">{formatCurrency(card.limit)}</div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm text-neutral-500">Utilization</div>
                      <div className={`text-sm font-medium ${getUtilizationColor(card.utilization)}`}>
                        {card.utilization.toFixed(0)}%
                      </div>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          card.utilization > 50 
                            ? "bg-accent-600" 
                            : card.utilization > 30 
                              ? "bg-accent-500" 
                              : "bg-secondary-500"
                        }`}
                        style={{ width: `${card.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">Update Balance</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update {card.name}</DialogTitle>
                        <DialogDescription>
                          Update your current balance and credit limit.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Current Balance</label>
                          <Input 
                            type="number"
                            defaultValue={card.balance}
                            id={`balance-${card.id}`}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Credit Limit</label>
                          <Input 
                            type="number"
                            defaultValue={card.limit}
                            id={`limit-${card.id}`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          const balanceInput = document.getElementById(`balance-${card.id}`) as HTMLInputElement;
                          const limitInput = document.getElementById(`limit-${card.id}`) as HTMLInputElement;
                          
                          if (balanceInput && limitInput) {
                            updateCardMutation.mutate({
                              id: card.id,
                              balance: parseFloat(balanceInput.value),
                              limit: parseFloat(limitInput.value)
                            });
                          }
                        }} disabled={updateCardMutation.isPending}>
                          {updateCardMutation.isPending ? "Updating..." : "Update Card"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
            
            {(!creditCards || creditCards.length === 0) && (
              <div className="col-span-full py-12 text-center bg-white rounded-lg shadow">
                <span className="material-icons text-neutral-400 text-4xl mb-2">credit_card_off</span>
                <h3 className="text-lg font-medium text-neutral-900 mb-1">No Credit Cards Found</h3>
                <p className="text-sm text-neutral-500">Add a credit card to start tracking your utilization.</p>
                <Button className="mt-4" onClick={() => setIsAddCardDialogOpen(true)}>Add Credit Card</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent transactions from your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                  Transaction history is not available in this demo.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
