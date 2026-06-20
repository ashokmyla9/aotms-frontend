import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "./dashboard";

export const Route = createFileRoute("/my-work-items")({
    component: MyWorkItems,
});

function MyWorkItems() {
    const { currentUser, state } = useApp();

    if (!currentUser) {
        return (
            <AppLayout>
                <div />
            </AppLayout>
        );
    }

    const myTasks = state.tasks.filter(
        (task) =>
            task.assignedToId === currentUser.id &&
            task.status !== "CANCELLED"
    );

    return (
        <AppLayout>
            <div className="space-y-5">

                <div>
                    <h2 className="text-xl font-semibold">
                        My Work Items
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Tasks assigned to you
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">
                                Assigned
                            </div>

                            <div className="text-2xl font-bold">
                                {
                                    myTasks.filter(
                                        (t) => t.status === "ASSIGNED"
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">
                                In Progress
                            </div>

                            <div className="text-2xl font-bold">
                                {
                                    myTasks.filter(
                                        (t) => t.status === "IN_PROGRESS"
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">
                                Postponed
                            </div>

                            <div className="text-2xl font-bold">
                                {
                                    myTasks.filter(
                                        (t) => t.status === "POSTPONED"
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">
                                Pending Approval
                            </div>

                            <div className="text-2xl font-bold">
                                {
                                    myTasks.filter(
                                        (t) =>
                                            t.status ===
                                            "PENDING_APPROVAL"
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Assigned Tasks
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        {myTasks.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No work items assigned
                            </div>
                        ) : (
                            <div className="space-y-3">

                                {myTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between">

                                            <div>
                                                <h3 className="font-semibold">
                                                    {task.name}
                                                </h3>

                                                <p className="text-sm text-muted-foreground">
                                                    {task.description}
                                                </p>

                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    Due Date : {task.dueDate}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <PriorityBadge
                                                    p={task.priority}
                                                />

                                                <StatusBadge
                                                    s={task.status}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}