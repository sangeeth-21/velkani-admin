export default function Settings() {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">General Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure your application preferences
            </p>
          </div>
          {/* Settings form would go here */}
          <p>Settings form will be displayed here</p>
        </div>
      </div>
    );
  }