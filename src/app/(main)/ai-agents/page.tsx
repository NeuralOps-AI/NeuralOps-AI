"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Agent {
  id: number;
  name: string;
  description: string;
  status: string;
  avatarUrl?: string;
}

const AgentCreationPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated avatar generator when no file is uploaded.
  const generateAvatar = (agentName: string) => {
    return `https://via.placeholder.com/150/000000/FFFFFF/?text=${agentName
      .substring(0, 2)
      .toUpperCase()}`;
  };

  // Update live preview avatar when name changes or file is uploaded.
  const updatePreviewAvatar = (agentName: string, file?: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result as string);
      reader.readAsDataURL(file);
    } else if (agentName.trim().length > 0) {
      setPreviewAvatar(generateAvatar(agentName));
    } else {
      setPreviewAvatar(null);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    updatePreviewAvatar(value, uploadedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedFile(file);
    updatePreviewAvatar(name, file);
  };

  const handleCreateAgent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const newAgent: Agent = {
      id: Date.now(),
      name,
      description,
      status,
      avatarUrl: previewAvatar || generateAvatar(name),
    };
    // Simulate API call delay.
    setTimeout(() => {
      setAgents((prev) => [...prev, newAgent]);
      setName("");
      setDescription("");
      setStatus("Active");
      setUploadedFile(null);
      setPreviewAvatar(null);
      setLoading(false);
    }, 1000);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditAgent(agent);
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent))
    );
    setEditAgent(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Container className="py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2">
            NeuralOps AI: Create Your Elite Autonomous Agent
          </h1>
          <p className="text-lg text-gray-400">
            Build, customize, and deploy intelligent AI agents that revolutionize your workflows.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Agent Creation Form */}
          <div>
            <Card className="bg-black border border-gray-800 p-6">
              <CardHeader>
                <CardTitle className="text-2xl">Create New AI Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAgent} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-gray-400">
                      Agent Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="mt-1 bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter agent name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="block text-sm font-medium text-gray-400">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter agent description"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="block text-sm font-medium text-gray-400">
                      Status
                    </Label>
                    <Select value={status} onValueChange={(value) => setStatus(value)}>
                      <SelectTrigger id="status" className="mt-1 bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white border-gray-700">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="avatar" className="block text-sm font-medium text-gray-400">
                      Upload Avatar (Optional)
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="mt-1 bg-gray-900 border-gray-700 text-white file:bg-gray-800 file:text-white"
                      accept="image/*"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Agent"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className="bg-black border border-gray-800 p-6 mt-8">
              <CardHeader>
                <CardTitle className="text-2xl">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-2">
                  Integrate with Eleven Labs for voice synthesis, DALL·E for AI-generated avatars,
                  and real-time analytics for operational insights.
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Voice Integration (Eleven Labs)</li>
                  <li>AI Avatar Generation (DALL·E)</li>
                  <li>Real-Time Performance Metrics</li>
                  <li>Customizable Workflows</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Preview & Agent List */}
          <div className="lg:pl-10">
            {/* Live Preview */}
            <Card className="bg-black border border-gray-800 p-6 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                {previewAvatar ? (
                  <img
                    src={previewAvatar}
                    alt="Agent Avatar Preview"
                    className="h-16 w-16 rounded-full border border-gray-700"
                  />
                ) : (
                  <Skeleton className="h-16 w-16 rounded-full" />
                )}
                <div>
                  <h3 className="text-xl font-bold">{name || "Agent Name"}</h3>
                  <p className="text-gray-400">{description || "Agent description will appear here."}</p>
                  <p className="text-sm text-green-500 mt-1">{status}</p>
                </div>
              </CardContent>
            </Card>

            {/* Existing Agents */}
            <Card className="bg-black border border-gray-800 p-6">
              <CardHeader>
                <CardTitle className="text-2xl">Existing AI Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <p className="text-gray-400">No agents created yet.</p>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <Card key={agent.id} className="bg-black border border-gray-800">
                        <CardHeader className="flex items-center justify-between">
                          <div className="flex items-center">
                            {agent.avatarUrl ? (
                              <img
                                src={agent.avatarUrl}
                                alt={`${agent.name} Avatar`}
                                className="h-12 w-12 rounded-full mr-4 border border-gray-700"
                              />
                            ) : (
                              <Skeleton className="h-12 w-12 rounded-full mr-4" />
                            )}
                            <CardTitle className="text-xl">{agent.name}</CardTitle>
                          </div>
                          {/* Edit button triggers popup modal */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Edit</Button>
                            </DialogTrigger>
                            <DialogContent className="bg-black border border-gray-800">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">Edit Agent</DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const form = e.currentTarget;
                                  const updatedName = form.agentName.value;
                                  const updatedDesc = form.agentDesc.value;
                                  const updatedStatus = form.agentStatus.value;
                                  const updatedAgent: Agent = {
                                    ...agent,
                                    name: updatedName,
                                    description: updatedDesc,
                                    status: updatedStatus,
                                  };
                                  handleUpdateAgent(updatedAgent);
                                }}
                                className="space-y-4 mt-4"
                              >
                                <div>
                                  <Label htmlFor="agentName" className="block text-sm font-medium text-gray-400">
                                    Agent Name
                                  </Label>
                                  <Input
                                    id="agentName"
                                    name="agentName"
                                    defaultValue={agent.name}
                                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="agentDesc" className="block text-sm font-medium text-gray-400">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="agentDesc"
                                    name="agentDesc"
                                    defaultValue={agent.description}
                                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="agentStatus" className="block text-sm font-medium text-gray-400">
                                    Status
                                  </Label>
                                  <Select defaultValue={agent.status} name="agentStatus">
                                    <SelectTrigger
                                      id="agentStatus"
                                      className="mt-1 bg-gray-900 border-gray-700 text-white"
                                    >
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 text-white border-gray-700">
                                      <SelectItem value="Active">Active</SelectItem>
                                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end">
                                  <Button type="submit">Save Changes</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400">{agent.description}</p>
                          <p className="mt-2 text-sm text-green-500">{agent.status}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Simulated Real-Time Activity Feed */}
        <section className="mt-10">
          <Card className="bg-black border border-gray-800 p-6">
            <CardHeader>
              <CardTitle className="text-2xl">Real-Time Agent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Live updates: Agents are processing tasks and optimizing workflows in real time.
              </p>
              {/* In production, replace this with a WebSocket stream or similar integration */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500">[12:34 PM] Agent Alpha completed task &ldquo;Data Sync&ldquo;.</p>
                <p className="text-sm text-gray-500">[12:35 PM] Agent Beta updated CRM records.</p>
                <p className="text-sm text-gray-500">[12:36 PM] Agent Gamma triggered adaptive learning module.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-10 text-center text-gray-500">
          This site is open source. Improve this page.
        </footer>
      </Container>
    </div>
  );
};

export default AgentCreationPage;
