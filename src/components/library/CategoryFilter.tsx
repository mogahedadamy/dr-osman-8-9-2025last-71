import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? "default" : "secondary"}
          className={`cursor-pointer hover:scale-105 transition-transform ${
            selectedCategory === category 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-primary/10"
          }`}
          onClick={() => onCategorySelect?.(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;