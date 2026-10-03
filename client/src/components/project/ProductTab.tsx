import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Check, Edit3, Plus, Trash2, FileText, ArrowRight } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { api } from '../../api/client';
import { Product } from '../../types';

export const ProductTab: React.FC = () => {
  const { activeProject, setActiveStep } = useProject();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Edit form state
  const [productName, setProductName] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [profileForm, setProfileForm] = useState<any>({
    category: '',
    usp: '',
    price: '',
    visualStyle: '',
    features: [],
    benefits: [],
    targetAudience: [],
    brandTone: [],
    keyClaims: [],
  });

  const loadProduct = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    try {
      const data = await api.getProduct(activeProject._id);
      if (data) {
        setProduct(data);
        setProductName(data.name || activeProject.title);
        setRawDescription(data.rawDescription || '');
        setProfileForm(data.profile || {});
      } else {
        setProductName(activeProject.title);
      }
    } catch (e) {
      // Not yet created
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [activeProject?._id]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject?._id) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('rawDescription', rawDescription);
      selectedFiles.forEach((f) => formData.append('files', f));

      const updated = await api.uploadProductMedia(activeProject._id, formData);
      setProduct(updated);
      setProfileForm(updated.profile);
      setSelectedFiles([]);
      success('Product media analyzed! Intelligence Profile successfully generated.');
    } catch (err: any) {
      error(err.message || 'Could not analyze product media. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!activeProject?._id) return;
    setIsSaving(true);
    try {
      const updated = await api.updateProductProfile(activeProject._id, {
        name: productName,
        ...profileForm,
      });
      setProduct(updated);
      success('Product profile saved! AI context updated across the project.');
    } catch (err: any) {
      error('Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReanalyze = async () => {
    if (!activeProject?._id) return;
    setIsAnalyzing(true);
    try {
      const updated = await api.reanalyzeProductProfile(activeProject._id);
      setProduct(updated);
      setProfileForm(updated.profile);
      success('Gemini re-extracted intelligence profile with latest context.');
    } catch (err: any) {
      error('Failed to re-analyze product profile.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton height={140} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height={260} />
          <Skeleton height={260} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Pipeline Stage 1
            </span>
            <Badge variant="brand" size="sm">
              <Sparkles className="w-3 h-3" />
              Product Intelligence Core
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Product Assets & Intelligence Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            The AI first understands the product, then every idea, script, shot plan, clip match, edit, and caption is built around it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {product?.profile?.name && (
            <Button
              onClick={() => setActiveStep('ideas')}
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Generate Ideas
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Raw Info */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand-400" />
              <span>1. Upload Product Media & Details</span>
            </h2>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <Input
                label="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. AuraPulse Pro Smart Mic"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Product Description / Specifications
                </label>
                <textarea
                  rows={4}
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  placeholder="Paste marketing copy, key specifications, price points, user manual text, or website links..."
                  className="w-full bg-dark-bg/80 border border-dark-border rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                />
              </div>

              {/* File upload input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Upload Product Media (Images, Video, PDF Brochure)
                </label>
                <div className="border-2 border-dashed border-dark-border hover:border-brand-500/50 rounded-xl p-4 text-center bg-dark-bg/40 cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-300 font-medium">
                      Drag files here or click to browse
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Supports JPG, PNG, MP4, MOV, PDF (Max 100MB)
                    </span>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="text-xs text-brand-300 font-medium mt-1">
                    {selectedFiles.length} file(s) ready to upload: {selectedFiles.map((f) => f.name).join(', ')}
                  </div>
                )}
              </div>

              {/* Uploaded files summary */}
              {product?.uploadedFiles && product.uploadedFiles.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-dark-border">
                  <span className="text-xs font-semibold text-slate-400">Uploaded Assets:</span>
                  <div className="space-y-1">
                    {product.uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-dark-surface/50 p-2 rounded-lg">
                        <FileText className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        <span className="truncate flex-1">{f.originalName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isAnalyzing}
                className="w-full"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {product ? 'Analyze & Re-generate Profile' : 'Extract Intelligence Profile'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Intelligence Profile Extracted by Gemini */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="space-y-5" glow>
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>2. Product Intelligence Profile</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Extracted by Gemini. Fully editable & injected into all creative stages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleReanalyze}
                  variant="ghost"
                  size="sm"
                  isLoading={isAnalyzing}
                >
                  Regenerate
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save Edits
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Category"
                value={profileForm.category || ''}
                onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                placeholder="e.g. Consumer Audio Tech"
              />
              <Input
                label="Price / Tier"
                value={profileForm.price || ''}
                onChange={(e) => setProfileForm({ ...profileForm, price: e.target.value })}
                placeholder="e.g. $129"
              />
            </div>

            {/* USP */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unique Selling Proposition (USP)
              </label>
              <textarea
                rows={2}
                value={profileForm.usp || ''}
                onChange={(e) => setProfileForm({ ...profileForm, usp: e.target.value })}
                placeholder="The single most compelling reason why customers buy this..."
                className="w-full bg-dark-bg/80 border border-dark-border rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Visual Style & Brand Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Visual Style
                </label>
                <input
                  value={profileForm.visualStyle || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, visualStyle: e.target.value })}
                  placeholder="e.g. Sleek matte black with neon rim lighting"
                  className="w-full bg-dark-bg/80 border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Brand Tone (comma-separated)
                </label>
                <input
                  value={Array.isArray(profileForm.brandTone) ? profileForm.brandTone.join(', ') : profileForm.brandTone || ''}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      brandTone: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Bold, Energetic, Authoritative"
                  className="w-full bg-dark-bg/80 border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Audience (comma-separated)
              </label>
              <input
                value={Array.isArray(profileForm.targetAudience) ? profileForm.targetAudience.join(', ') : profileForm.targetAudience || ''}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    targetAudience: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. Video Creators, Streamers, Remote Workers"
                className="w-full bg-dark-bg/80 border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Key Features List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Key Features ({profileForm.features?.length || 0})
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setProfileForm({
                      ...profileForm,
                      features: [...(profileForm.features || []), 'New feature description'],
                    })
                  }
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Feature</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {(profileForm.features || []).map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={feat}
                      onChange={(e) => {
                        const updated = [...profileForm.features];
                        updated[idx] = e.target.value;
                        setProfileForm({ ...profileForm, features: updated });
                      }}
                      className="flex-1 bg-dark-bg/60 border border-dark-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = profileForm.features.filter((_: any, i: number) => i !== idx);
                        setProfileForm({ ...profileForm, features: updated });
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Claims */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verified Marketing Claims
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(profileForm.keyClaims || []).map((claim: string, idx: number) => (
                  <Badge key={idx} variant="brand" size="md">
                    {claim}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
