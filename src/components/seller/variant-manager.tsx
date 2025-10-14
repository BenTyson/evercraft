/**
 * Variant Manager Component
 *
 * Comprehensive UI for sellers to define variant options and manage variant combinations.
 * Supports up to 2 option types with 70 values each (Etsy standard).
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Trash2, AlertCircle, Shuffle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PREDEFINED_OPTION_TYPES,
  MAX_OPTION_TYPES,
  MAX_VALUES_PER_TYPE,
  type VariantOption,
  type VariantInput,
  type VariantOptionsData,
  generateCombinations,
  formatVariantName,
  validateVariantOptions,
} from '@/types/variants';

interface ProductImage {
  id?: string;
  url: string;
  altText?: string;
}

interface VariantManagerProps {
  productPrice: number; // Base product price for inheritance
  productImages: ProductImage[];
  initialOptions?: VariantOptionsData;
  initialVariants?: VariantInput[];
  onChange: (options: VariantOptionsData, variants: VariantInput[]) => void;
}

export function VariantManager({
  productPrice,
  productImages,
  initialOptions,
  initialVariants = [],
  onChange,
}: VariantManagerProps) {
  // Option types state
  const [options, setOptions] = useState<VariantOption[]>(initialOptions?.options || []);

  // Image selection modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalVariantIndex, setImageModalVariantIndex] = useState<number | null>(null);

  // Current option being edited
  const [currentOptionName, setCurrentOptionName] = useState('');
  const [currentOptionValues, setCurrentOptionValues] = useState<string[]>([]);
  const [currentValueInput, setCurrentValueInput] = useState('');
  const [isCustomOption, setIsCustomOption] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<VariantInput[]>(initialVariants);
  const [hasGenerated, setHasGenerated] = useState(initialVariants.length > 0);

  // Validation
  const [errors, setErrors] = useState<string[]>([]);

  // Notify parent of changes
  useEffect(() => {
    onChange({ options }, variants);
  }, [options, variants, onChange]);

  // Add new option type
  const addOption = () => {
    if (!currentOptionName.trim()) {
      setErrors(['Please enter an option name']);
      return;
    }

    if (currentOptionValues.length === 0) {
      setErrors(['Please add at least one value']);
      return;
    }

    if (options.length >= MAX_OPTION_TYPES) {
      setErrors([`Maximum ${MAX_OPTION_TYPES} option types allowed`]);
      return;
    }

    // Check for duplicate option names
    if (options.some((opt) => opt.name.toLowerCase() === currentOptionName.toLowerCase())) {
      setErrors([`Option "${currentOptionName}" already exists`]);
      return;
    }

    const newOption: VariantOption = {
      name: currentOptionName,
      position: options.length,
      values: currentOptionValues,
      isCustom: isCustomOption,
    };

    const newOptions = [...options, newOption];

    // Validate
    const validation = validateVariantOptions({ options: newOptions });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setOptions(newOptions);
    setErrors([]);

    // Reset form
    setCurrentOptionName('');
    setCurrentOptionValues([]);
    setCurrentValueInput('');
    setIsCustomOption(false);
    setHasGenerated(false); // Mark for regeneration
  };

  // Remove option type
  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setHasGenerated(false);
    setVariants([]);
  };

  // Add value to current option
  const addValue = () => {
    if (!currentValueInput.trim()) return;

    if (currentOptionValues.length >= MAX_VALUES_PER_TYPE) {
      setErrors([`Maximum ${MAX_VALUES_PER_TYPE} values per option`]);
      return;
    }

    // Check for duplicate
    if (currentOptionValues.some((v) => v.toLowerCase() === currentValueInput.toLowerCase())) {
      setErrors([`Value "${currentValueInput}" already exists`]);
      return;
    }

    setCurrentOptionValues([...currentOptionValues, currentValueInput.trim()]);
    setCurrentValueInput('');
    setErrors([]);
  };

  // Remove value from current option
  const removeValue = (value: string) => {
    setCurrentOptionValues(currentOptionValues.filter((v) => v !== value));
  };

  // Generate all variant combinations
  const generateVariants = () => {
    if (options.length === 0) {
      setErrors(['Please add at least one option type']);
      return;
    }

    const combinations = generateCombinations(options);

    const newVariants: VariantInput[] = combinations.map((combo) => ({
      name: formatVariantName(combo),
      sku: undefined,
      price: null, // Inherit from product
      inventoryQuantity: 0,
      trackInventory: true,
      imageId: null,
    }));

    setVariants(newVariants);
    setHasGenerated(true);
    setErrors([]);
  };

  // Update a specific variant field
  const updateVariant = (
    index: number,
    field: keyof VariantInput,
    value: string | number | boolean | null
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Delete variant
  const deleteVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Bulk set price for all variants
  const bulkSetPrice = () => {
    const priceInput = prompt(
      'Enter price for all variants (leave empty to inherit from product):'
    );
    if (priceInput === null) return; // Cancelled

    const price = priceInput === '' ? null : parseFloat(priceInput);
    if (priceInput !== '' && (isNaN(price!) || price! < 0)) {
      alert('Invalid price');
      return;
    }

    setVariants(variants.map((v) => ({ ...v, price })));
  };

  // Bulk set inventory for all variants
  const bulkSetInventory = () => {
    const invInput = prompt('Enter inventory quantity for all variants:');
    if (invInput === null) return;

    const quantity = parseInt(invInput);
    if (isNaN(quantity) || quantity < 0) {
      alert('Invalid quantity');
      return;
    }

    setVariants(variants.map((v) => ({ ...v, inventoryQuantity: quantity })));
  };

  // Calculate total possible combinations
  const totalCombinations =
    options.length === 0 ? 0 : options.reduce((acc, opt) => acc * opt.values.length, 1);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-2">
            <AlertCircle className="size-5 flex-shrink-0 text-red-600" />
            <div className="space-y-1">
              {errors.map((error, i) => (
                <p key={i} className="text-sm text-red-800">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Option Type Builder */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Variant Options ({options.length}/{MAX_OPTION_TYPES})
          </h3>
        </div>

        {/* Current Options Display */}
        {options.length > 0 && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="rounded-lg border bg-neutral-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-semibold">{option.name}</span>
                      {option.isCustom && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {option.values.map((value) => (
                        <span
                          key={value}
                          className="rounded-full border bg-white px-3 py-1 text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {option.values.length} values
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Option */}
        {options.length < MAX_OPTION_TYPES && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Add Option Type</h4>

            {/* Option Name Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Option Type</label>
              <div className="flex gap-2">
                <select
                  value={isCustomOption ? 'custom' : currentOptionName}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomOption(true);
                      setCurrentOptionName('');
                    } else {
                      setIsCustomOption(false);
                      setCurrentOptionName(e.target.value);
                    }
                  }}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select option type...</option>
                  {PREDEFINED_OPTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="custom">Custom option type...</option>
                </select>
              </div>
            </div>

            {/* Custom Option Name Input */}
            {isCustomOption && (
              <div>
                <label className="mb-2 block text-sm font-medium">Custom Option Name</label>
                <Input
                  value={currentOptionName}
                  onChange={(e) => setCurrentOptionName(e.target.value)}
                  placeholder="e.g., Thread Count, Length, Width"
                  maxLength={20}
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  {currentOptionName.length}/20 characters
                </p>
              </div>
            )}

            {/* Values */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Values ({currentOptionValues.length}/{MAX_VALUES_PER_TYPE})
              </label>

              {/* Value Input */}
              <div className="flex gap-2">
                <Input
                  value={currentValueInput}
                  onChange={(e) => setCurrentValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addValue();
                    }
                  }}
                  placeholder="e.g., Small, Medium, Large"
                  maxLength={20}
                />
                <Button type="button" onClick={addValue} size="sm">
                  <Plus className="size-4" />
                </Button>
              </div>

              {/* Current Values */}
              {currentOptionValues.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentOptionValues.map((value) => (
                    <span
                      key={value}
                      className="flex items-center gap-1.5 rounded-full border bg-neutral-100 py-1 pr-2 pl-3 text-sm"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => removeValue(value)}
                        className="rounded-full p-0.5 hover:bg-neutral-200"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add Option Button */}
            <Button
              type="button"
              onClick={addOption}
              disabled={!currentOptionName || currentOptionValues.length === 0}
            >
              <Plus className="mr-2 size-4" />
              Add Option Type
            </Button>
          </div>
        )}
      </div>

      {/* Generate Variants */}
      {options.length > 0 && !hasGenerated && (
        <div className="bg-card rounded-lg border p-6 text-center">
          <Shuffle className="text-muted-foreground mx-auto mb-3 size-12" />
          <h3 className="mb-2 text-lg font-bold">Generate Variants</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {totalCombinations} variant combinations will be created from your options
          </p>
          <Button type="button" onClick={generateVariants} size="lg">
            <Shuffle className="mr-2 size-5" />
            Generate {totalCombinations} Variants
          </Button>
        </div>
      )}

      {/* Variant Table */}
      {hasGenerated && variants.length > 0 && (
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Variants ({variants.length})</h3>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={bulkSetPrice}>
                Bulk Set Price
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={bulkSetInventory}>
                Bulk Set Inventory
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={generateVariants}>
                <Shuffle className="mr-2 size-4" />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">Variant</th>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Inventory</th>
                  <th className="px-4 py-3 text-left font-semibold">Image</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={index} className="border-b hover:bg-neutral-50">
                    {/* Name */}
                    <td className="px-4 py-3 font-medium">{variant.name}</td>

                    {/* SKU */}
                    <td className="px-4 py-3">
                      <Input
                        type="text"
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value || null)}
                        placeholder="Optional"
                        className="w-32"
                      />
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price ?? ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'price',
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          placeholder={`$${productPrice.toFixed(2)}`}
                          className="w-28"
                        />
                        {variant.price === null && (
                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                            (inherits)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Inventory */}
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        value={variant.inventoryQuantity}
                        onChange={(e) =>
                          updateVariant(index, 'inventoryQuantity', parseInt(e.target.value) || 0)
                        }
                        className="w-24"
                      />
                    </td>

                    {/* Image */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setImageModalVariantIndex(index);
                          setImageModalOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                      >
                        {variant.imageId ? (
                          <>
                            {(() => {
                              const selectedImage = productImages.find(
                                (img, imgIndex) =>
                                  (img.id || imgIndex.toString()) === variant.imageId
                              );
                              return selectedImage ? (
                                <>
                                  <img
                                    src={selectedImage.url}
                                    alt="Selected"
                                    className="size-8 rounded object-cover"
                                  />
                                  <span>Change</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="size-4" />
                                  <span>Select image</span>
                                </>
                              );
                            })()}
                          </>
                        ) : (
                          <>
                            <ImageIcon className="size-4" />
                            <span>Select image</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteVariant(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-neutral-50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Variants:</span>
              <span>{variants.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">Total Inventory:</span>
              <span>{variants.reduce((sum, v) => sum + v.inventoryQuantity, 0)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">Price Range:</span>
              <span>
                {(() => {
                  const prices = variants.map((v) => v.price ?? productPrice);
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  return min === max
                    ? `$${min.toFixed(2)}`
                    : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Image Selection Modal */}
      {imageModalOpen && imageModalVariantIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
              <h3 className="text-lg font-semibold">
                Select Image for {variants[imageModalVariantIndex]?.name}
              </h3>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {/* No image option */}
                <button
                  type="button"
                  onClick={() => {
                    updateVariant(imageModalVariantIndex, 'imageId', null);
                    setImageModalOpen(false);
                  }}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border-2 transition-all ${
                    !variants[imageModalVariantIndex]?.imageId
                      ? 'border-forest-dark bg-white'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="mb-2 size-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">No image</span>
                  </div>
                  {!variants[imageModalVariantIndex]?.imageId && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-forest-dark rounded-full p-0.5">
                        <svg
                          className="size-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                {/* Product images */}
                {productImages.map((img, imgIndex) => {
                  const imageId = img.id || imgIndex.toString();
                  const isSelected = variants[imageModalVariantIndex]?.imageId === imageId;

                  return (
                    <button
                      key={imageId}
                      type="button"
                      onClick={() => {
                        updateVariant(imageModalVariantIndex, 'imageId', imageId);
                        setImageModalOpen(false);
                      }}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-forest-dark ring-forest-dark ring-2 ring-offset-2'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.altText || `Image ${imgIndex + 1}`}
                        className="size-full object-cover"
                      />
                      {isSelected && (
                        <div className="bg-forest-dark/20 absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-white p-1">
                            <svg
                              className="text-forest-dark size-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="absolute right-0 bottom-0 left-0 truncate bg-black/50 p-1 text-center text-xs text-white">
                        {(() => {
                          // Try to extract filename from URL if altText is not useful
                          if (img.altText && img.altText.trim() && img.altText.length < 50) {
                            return img.altText;
                          }
                          // Extract filename from URL
                          try {
                            const urlParts = img.url.split('/');
                            const filename = urlParts[urlParts.length - 1];
                            const decoded = decodeURIComponent(filename);
                            // Remove any query parameters
                            const cleanName = decoded.split('?')[0];
                            // If filename is too long, show just the extension part
                            if (cleanName.length > 30) {
                              const parts = cleanName.split('.');
                              const ext = parts[parts.length - 1];
                              return `...${cleanName.slice(-20)}`;
                            }
                            return cleanName;
                          } catch {
                            return `Image ${imgIndex + 1}`;
                          }
                        })()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {productImages.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <ImageIcon className="mx-auto mb-2 size-12 text-gray-400" />
                  <p>No product images available</p>
                  <p className="text-sm">Add images to the product first</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
