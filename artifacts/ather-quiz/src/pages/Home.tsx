import { Link } from "wouter";
import { LECTURES } from "../data/questions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="border-b px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">آثــــر | ATHER 🫆</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">صلــي علــى النبــــي</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LECTURES.map((lecture) => {
            const hasQuestions = lecture.questions.length > 0;

            const cardContent = (
              <Card className={`h-full transition-all duration-200 border-2 ${hasQuestions ? 'hover:border-primary hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed bg-muted/50'}`} data-testid={`card-lecture-${lecture.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={hasQuestions ? "default" : "secondary"}>
                      Lecture {lecture.id}
                    </Badge>
                    {hasQuestions ? (
                      <span className="text-sm font-medium text-muted-foreground">
                        {lecture.questions.length} Qs
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{lecture.topic}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {hasQuestions 
                      ? "Ready to test your knowledge on this topic."
                      : "Questions are being prepared for this lecture."}
                  </p>
                </CardContent>
              </Card>
            );

            if (hasQuestions) {
              return (
                <Link key={lecture.id} href={`/quiz?lecture=${lecture.id}`} className="block">
                  {cardContent}
                </Link>
              );
            }

            return <div key={lecture.id}>{cardContent}</div>;
          })}
        </div>
      </main>
    </div>
  );
}
