import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Trash2, Package } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import BottomNavigation from "@/components/shared/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  completed: boolean;
  urgent: boolean;
}

const ShoppingList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: 1, name: "حفاضات للمولود", category: "طفل", completed: false, urgent: true },
    { id: 2, name: "ملابس داخلية للحمل", category: "أم", completed: true, urgent: false },
    { id: 3, name: "كريم مرطب للبطن", category: "عناية", completed: false, urgent: false },
    { id: 4, name: "فيتامينات الحمل", category: "صحة", completed: false, urgent: true },
    { id: 5, name: "وسادة الحمل", category: "راحة", completed: false, urgent: false },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("عام");

  const categories = ["عام", "طفل", "أم", "عناية", "صحة", "راحة", "منزل"];

  const categoryEmojis = {
    "عام": "📝",
    "طفل": "👶",
    "أم": "🤱",
    "عناية": "🧴",
    "صحة": "💊",
    "راحة": "😴",
    "منزل": "🏠"
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: Math.max(...items.map(i => i.id)) + 1,
      name: newItemName,
      category: selectedCategory,
      completed: false,
      urgent: false
    };
    
    setItems([...items, newItem]);
    setNewItemName("");
    
    toast({
      title: "تم إضافة العنصر",
      description: `تم إضافة "${newItemName}" إلى قائمة التسوق`,
    });
  };

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const toggleUrgent = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, urgent: !item.urgent } : item
    ));
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "تم حذف العنصر",
      description: "تم حذف العنصر من قائمة التسوق",
    });
  };

  const completedCount = items.filter(item => item.completed).length;
  const urgentCount = items.filter(item => item.urgent && !item.completed).length;

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const bottomNavItems = [
    {
      icon: <ShoppingCart className="w-5 h-5 mb-1 text-primary" />,
      label: "قائمة التسوق"
    },
    {
      icon: <Package className="w-5 h-5 mb-1 text-secondary" />,
      label: "الفئات"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageHeader title="قائمة التسوق" />

      <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Summary */}
        <Card className="shadow-card bg-primary-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{items.length}</div>
                <div className="text-sm text-muted-foreground">إجمالي العناصر</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completedCount}</div>
                <div className="text-sm text-muted-foreground">تم شراؤها</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{urgentCount}</div>
                <div className="text-sm text-muted-foreground">عاجل</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Item */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              إضافة عنصر جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="اسم العنصر..."
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                className="flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {categoryEmojis[category as keyof typeof categoryEmojis]} {category}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={addItem} className="w-full">
              إضافة إلى القائمة
            </Button>
          </CardContent>
        </Card>

        {/* Shopping Items by Category */}
        {categories.map(category => {
          const categoryItems = groupedItems[category];
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category} className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{categoryEmojis[category as keyof typeof categoryEmojis]}</span>
                  {category}
                  <Badge variant="secondary" className="mr-auto">
                    {categoryItems.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      item.completed 
                        ? 'bg-muted/50 border-muted' 
                        : 'bg-background border-border hover:shadow-sm'
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <span className={`${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.name}
                      </span>
                      {item.urgent && !item.completed && (
                        <Badge variant="destructive" className="mr-2 text-xs">
                          عاجل
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUrgent(item.id)}
                        className={`text-xs ${item.urgent ? 'text-red-500' : 'text-muted-foreground'}`}
                      >
                        {item.urgent ? '🔥' : '⚠️'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Quick Add Suggestions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>اقتراحات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "مقعد السيارة للطفل", category: "طفل" },
                { name: "عربة الأطفال", category: "طفل" },
                { name: "زجاجات الرضاعة", category: "طفل" },
                { name: "بودرة الأطفال", category: "عناية" },
                { name: "كريم طفح الحفاض", category: "عناية" },
                { name: "مناديل مبللة", category: "عناية" }
              ].map((suggestion) => (
                <Button
                  key={suggestion.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem: ShoppingItem = {
                      id: Math.max(...items.map(i => i.id)) + 1,
                      name: suggestion.name,
                      category: suggestion.category,
                      completed: false,
                      urgent: false
                    };
                    setItems([...items, newItem]);
                    toast({
                      title: "تم إضافة العنصر",
                      description: `تم إضافة "${suggestion.name}" إلى قائمة التسوق`,
                    });
                  }}
                  className="text-xs h-8"
                >
                  + {suggestion.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation items={bottomNavItems} />
    </div>
  );
};

export default ShoppingList;