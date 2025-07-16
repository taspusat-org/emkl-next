import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GridRoleUser from './GridRoleUser';
import GridUserAcl from './GridUserAcl';

export function GridTabs() {
  return (
    <Tabs defaultValue="role" className="h-full w-full">
      <TabsList
        className="flex w-full flex-row justify-start gap-1 rounded-t-sm border border-blue-500"
        style={{
          background: 'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
        }}
      >
        <TabsTrigger value="role">Role</TabsTrigger>
        <TabsTrigger value="acl">Acl</TabsTrigger>
      </TabsList>
      <TabsContent value="role" className="h-full">
        <GridRoleUser />
      </TabsContent>
      <TabsContent value="acl" className="h-full">
        <GridUserAcl />
      </TabsContent>
    </Tabs>
  );
}
