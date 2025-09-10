import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  activeTab: 'videos' | 'articles';
  totalResults: number;
}

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategorySelect,
  activeTab,
  totalResults
}: SearchAndFilterProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => {
    onSearchChange("");
    onCategorySelect("الكل");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "الكل";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder={`ابحثي في ${activeTab === 'videos' ? 'الفيديوهات' : 'المقالات'}...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 pl-10 py-3 text-right"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle and Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            الفئات
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="text-muted-foreground hover:text-foreground"
            >
              مسح الفلاتر
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {totalResults} نتيجة
        </div>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-3 text-right">الفئات</h4>
          <div className="flex flex-wrap gap-2 justify-end">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => onCategorySelect(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              البحث: {searchQuery}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
                className="p-0 h-4 w-4 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {selectedCategory !== "الكل" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              الفئة: {selectedCategory}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCategorySelect("الكل")}
                className="p-0 h-4 w-4 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;