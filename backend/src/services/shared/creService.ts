import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { CRE_CONFIG } from "../../config/chainlink";

interface WorkflowExecution {
    executionId: string;
    workflowId: string;
    status: "pending" | "running" | "completed" | "failed";
    startedAt: number;
    completedAt?: number;
    outputs?: Record<string, any>;
    error?: string;
}

export class CREService {
    private executions: Map<string, WorkflowExecution> = new Map();
    private schedules: Map<string, NodeJS.Timer> = new Map();
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor() {
        this.baseUrl = CRE_CONFIG.nodeUrl;
        this.headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CRE_CONFIG.apiKey}`,
        };
    }

    async registerWorkflow(yamlPath: string): Promise<string> {
        try {
            const content = fs.readFileSync(yamlPath, "utf-8");
            const response = await axios.post(
                `${this.baseUrl}/v1/workflows`,
                { spec: content },
                { headers: this.headers }
            );
            console.log(`CRE Workflow registered: ${response.data.id}`);
            return response.data.id;
        } catch (err: any) {
            console.error("CRE workflow registration failed:", err.message);
            // Return a local ID for testing mode
            return `local-${Date.now()}`;
        }
    }

    async executeWorkflow(workflowId: string, params: Record<string, any>): Promise<string> {
        const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const execution: WorkflowExecution = {
            executionId,
            workflowId,
            status: "pending",
            startedAt: Date.now(),
        };
        this.executions.set(executionId, execution);

        try {
            const response = await axios.post(
                `${this.baseUrl}/v1/workflows/${workflowId}/execute`,
                { inputs: params },
                { headers: this.headers }
            );
            execution.status = "running";
            execution.executionId = response.data.executionId || executionId;
            return execution.executionId;
        } catch (err: any) {
            console.error("CRE execution failed:", err.message);
            execution.status = "failed";
            execution.error = err.message;
            return executionId;
        }
    }

    async getWorkflowStatus(executionId: string): Promise<WorkflowExecution | null> {
        return this.executions.get(executionId) || null;
    }

    scheduleRecurring(workflowId: string, intervalMs: number, params: Record<string, any>): string {
        const scheduleId = `sched-${Date.now()}`;
        const timer = setInterval(async () => {
            console.log(`CRE: Executing recurring workflow ${workflowId}`);
            await this.executeWorkflow(workflowId, params);
        }, intervalMs);

        this.schedules.set(scheduleId, timer as unknown as NodeJS.Timer);
        console.log(`CRE: Scheduled workflow ${workflowId} every ${intervalMs / 1000}s`);
        return scheduleId;
    }

    stopSchedule(scheduleId: string): boolean {
        const timer = this.schedules.get(scheduleId);
        if (timer) {
            clearInterval(timer as any);
            this.schedules.delete(scheduleId);
            return true;
        }
        return false;
    }

    getActiveSchedules(): string[] {
        return Array.from(this.schedules.keys());
    }
}

export const creService = new CREService();
