import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useDashboard } from "@/store/dashboard-context";
import { useThemeRules, useCreateThemeRule, useDeleteThemeRule, useClassifyText } from "@/hooks/use-theme-rules";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ThemesPage() {
  const { data, updateRowTheme } = useDashboard();
  const { data: rules = [], isLoading: loadingRules } = useThemeRules();
  const createRule = useCreateThemeRule();
  const deleteRule = useDeleteThemeRule();
  const classify = useClassifyText();
  const { toast } = useToast();

  const [isAiRunning, setIsAiRunning] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleKeywords, setNewRuleKeywords] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const unclassifiedCount = data.filter(d => !d.tema || d.tema === "Outros").length;

  const handleCreateRule = async () => {
    if (!newRuleName || !newRuleKeywords) return;
    await createRule.mutateAsync({
      name: newRuleName,
      keywords: newRuleKeywords.split(",").map(k => k.trim()).filter(k => k),
    });
    setDialogOpen(false);
    setNewRuleName("");
    setNewRuleKeywords("");
  };

  const handleRunAI = async () => {
    const unclassified = data.filter(d => !d.tema || d.tema === "Outros");
    if (unclassified.length === 0) {
      toast({ title: "Nothing to classify", description: "All rows already have themes." });
      return;
    }

    setIsAiRunning(true);
    let processed = 0;
    
    // Process a subset to avoid huge API costs/time in demo
    const batch = unclassified.slice(0, 10); // Limit to 10 for demo purposes

    toast({ title: "AI Started", description: `Classifying ${batch.length} rows...` });

    try {
      for (const row of batch) {
        if (!row.resumoConversa) continue;
        
        const result = await classify.mutateAsync({
          text: row.resumoConversa,
          themes: rules.map(r => r.name),
        });
        
        if (result.theme) {
          updateRowTheme(row.id, result.theme);
          processed++;
        }
      }
      toast({ title: "AI Complete", description: `Successfully classified ${processed} rows.` });
    } catch (err) {
      console.error(err);
      toast({ title: "AI Error", description: "Something went wrong during classification.", variant: "destructive" });
    } finally {
      setIsAiRunning(false);
    }
  };

  return (
    <Layout title="Themes & AI" subtitle="Manage classification rules and run AI analysis">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Active Rules</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Theme Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Theme Name</Label>
                    <Input 
                      placeholder="e.g. Financeiro" 
                      value={newRuleName} 
                      onChange={e => setNewRuleName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords (comma separated)</Label>
                    <Input 
                      placeholder="boleto, fatura, pagamento" 
                      value={newRuleKeywords} 
                      onChange={e => setNewRuleKeywords(e.target.value)} 
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateRule} 
                    disabled={createRule.isPending}
                  >
                    {createRule.isPending ? "Saving..." : "Create Rule"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingRules ? (
              <p>Loading rules...</p>
            ) : rules.map(rule => (
              <Card key={rule.id} className="group relative hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteRule.mutate(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {rule.keywords.map(k => (
                      <Badge key={k} variant="secondary" className="font-normal text-muted-foreground">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Action Panel */}
        <div>
          <Card className="bg-gradient-to-b from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Auto-Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Use AI to analyze "Outros" or unclassified rows.</p>
                <p className="mt-2">
                  Current Unclassified: <span className="font-bold text-foreground">{unclassifiedCount}</span>
                </p>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                onClick={handleRunAI}
                disabled={isAiRunning || unclassifiedCount === 0}
              >
                {isAiRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Classifying...
                  </>
                ) : (
                  "Start Classification"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                *Demo limited to 10 items per run
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
