import { EgoNodeInfo, NodeContent } from "@backend/api";


export class NodeService {

    public all(): Promise<EgoNodeInfo[]> {

        return fetch("/api/node")
            .then(response => {
                if (response.ok) {
                    return response.json();
                }

                return Promise.reject<EgoNodeInfo[]>(response.statusText);
            });
    }

    public one(nodeId: string): Promise<NodeContent> {

        return fetch(`/api/node/${nodeId}`)
            .then(response => {
                if (response.ok) {
                    return response.json() as any;
                }

                return Promise.reject<NodeContent>(response.statusText);
            });
    }
}

