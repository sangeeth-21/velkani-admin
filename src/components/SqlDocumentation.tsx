
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SqlDocumentationProps {
  title: string;
  sqlSchema: string;
}

const SqlDocumentation: React.FC<SqlDocumentationProps> = ({
  title,
  sqlSchema,
}) => {
  // Highlight SQL keywords
  const highlightSql = (sql: string) => {
    return sql
      .replace(
        /(CREATE TABLE|PRIMARY KEY|REFERENCES|DEFAULT|NOT NULL|UNIQUE|INTEGER|VARCHAR|TEXT|DECIMAL|TIMESTAMP|SERIAL)/g,
        '<span style="color: #569CD6;">$1</span>'
      )
      .replace(/\((\d+)\)/g, '(<span style="color: #CE9178;">$1</span>)')
      .replace(/\((\d+),(\d+)\)/g, '(<span style="color: #CE9178;">$1,$2</span>)');
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {title}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <FileText size={16} />
                <span>SQL Schema</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] max-w-[90vw] p-0" align="end">
              <div className="p-4 bg-gray-950 text-gray-200 rounded-md overflow-auto max-h-[400px]">
                <pre 
                  className="text-sm font-mono"
                  dangerouslySetInnerHTML={{ __html: highlightSql(sqlSchema) }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre 
          className="bg-gray-950 text-gray-200 p-4 rounded-md overflow-auto text-sm font-mono"
          dangerouslySetInnerHTML={{ __html: highlightSql(sqlSchema) }}
        />
      </CardContent>
    </Card>
  );
};

export default SqlDocumentation;
