import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, Gift, ShoppingBag } from 'lucide-react';

export default function InventoryScreen() {
  return (
    <div className="p-6 space-y-6 mt-24">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gradient mb-2">Inventory</h1>
        <p className="text-muted-foreground">Manage your items and gifts</p>
      </div>

      {/* Empty State */}
      <Card className="tonix-card p-8 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Your inventory is empty
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Complete tasks and open cases to collect items
        </p>
        
        <div className="space-y-3">
          <Button className="w-full tonix-button bg-gradient-primary hover:opacity-90">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Open Cases
          </Button>
          
          <Button variant="outline" className="w-full tonix-button border-tonix-primary text-tonix-primary hover:bg-tonix-primary hover:text-primary-foreground">
            <Gift className="w-5 h-5 mr-2" />
            Send Gifts
          </Button>
        </div>
      </Card>

      {/* Coming Soon Features */}
      <div className="grid gap-4">
        <Card className="p-4 bg-tonix-surface border-dashed border-2 border-muted">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
            <div>
              <h4 className="font-semibold text-muted-foreground">Loot Cases</h4>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-tonix-surface border-dashed border-2 border-muted">
          <div className="flex items-center space-x-3">
            <Gift className="w-6 h-6 text-muted-foreground" />
            <div>
              <h4 className="font-semibold text-muted-foreground">Gift System</h4>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}