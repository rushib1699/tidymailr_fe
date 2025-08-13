import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { plans } from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Calendar, Search } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PlanItem {
    type: string;
    notes?: string;
    start: string;
    title: string;
    duration_minutes: number;
}

export default function PlansPage() {
    const { state, actions } = useApp();
    const [allPlans, setAllPlans] = useState<PlanItem[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<PlanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [selectedType, setSelectedType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        dayjs().format("YYYY-MM-DD")
    );

    useEffect(() => {
        loadPlans(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        filterPlans();
    }, [allPlans, selectedType, searchQuery]);

    const loadPlans = async (date: string): Promise<void> => {
        try {
            if (!state.user?.id) {
                setAllPlans([]);
                return;
            }
            setIsLoading(true);
            const response = await plans.getPlans({
                user_id: state.user.id,
                date,
            });

            if (Array.isArray(response) && response.length > 0) {
                const parsedPlan = JSON.parse(response[0].plan);
                setAllPlans(parsedPlan.plan || []);
            } else {
                setAllPlans([]);
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            actions.setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPlans = () => {
        let filtered = [...allPlans];

        if (selectedType !== "all") {
            filtered = filtered.filter(
                (plan) => plan.type.toLowerCase() === selectedType.toLowerCase()
            );
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (plan) =>
                    plan.title.toLowerCase().includes(q) ||
                    (plan.notes && plan.notes.toLowerCase().includes(q))
            );
        }

        setFilteredPlans(filtered);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="py-4 sm:py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold">My Plans</h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                        Your scheduled activities
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-6 sm:mb-8">
                    <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Search Bar */}
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by title or notes"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="type-filter">Filter by Type</Label>
                            <Select
                                value={selectedType}
                                onValueChange={setSelectedType}
                            >
                                <SelectTrigger id="type-filter">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="followup">Follow Up</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="call">Call</SelectItem>
                                    <SelectItem value="task">Task</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="date-filter">Select Date</Label>
                            <Input
                                id="date-filter"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Plans List */}
                {filteredPlans.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">No plans found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPlans.map((item, idx) => (
                            <Card key={idx} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {dayjs(item.start)
                                                .tz("America/New_York")
                                                .format("hh:mm A")}
                                            {" • "}
                                            {item.duration_minutes} min
                                        </span>
                                    </div>
                                    <h3 className="font-semibold">{item.title}</h3>
                                    {item.notes && (
                                        <p className="text-sm text-muted-foreground">
                                            {item.notes}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
