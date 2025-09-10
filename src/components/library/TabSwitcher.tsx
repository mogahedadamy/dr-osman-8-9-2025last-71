import { Button } from "@/components/ui/button";
import { Play, BookOpen, Stethoscope } from "lucide-react";
import { LibraryTab } from "@/types";

interface TabSwitcherProps {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
}

const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className="flex space-x-1 space-x-reverse mb-6 bg-muted rounded-lg p-1">
      <Button
        variant={activeTab === "videos" ? "default" : "ghost"}
        onClick={() => onTabChange("videos")}
        className={`flex-1 text-xs ${
          activeTab === "videos" 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground"
        }`}
        size="sm"
      >
        <Play className="w-3 h-3 ml-1" />
        فيديوهات
      </Button>
      <Button
        variant={activeTab === "articles" ? "default" : "ghost"}
        onClick={() => onTabChange("articles")}
        className={`flex-1 text-xs ${
          activeTab === "articles" 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground"
        }`}
        size="sm"
      >
        <BookOpen className="w-3 h-3 ml-1" />
        مقالات
      </Button>
      <Button
        variant={activeTab === "encyclopedia" ? "default" : "ghost"}
        onClick={() => onTabChange("encyclopedia")}
        className={`flex-1 text-xs ${
          activeTab === "encyclopedia" 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground"
        }`}
        size="sm"
      >
        <Stethoscope className="w-3 h-3 ml-1" />
        الموسوعة
      </Button>
    </div>
  );
};

export default TabSwitcher;