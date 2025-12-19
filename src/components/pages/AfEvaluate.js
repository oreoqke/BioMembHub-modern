import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Viewer } from 'molstar/lib/apps/viewer/app';
import { Color } from 'molstar/lib/mol-util/color';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { StructureSelection } from 'molstar/lib/mol-model/structure';
import { StructureSelectionQueries } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';
import { setStructureTransparency } from 'molstar/lib/mol-plugin-state/helpers/structure-transparency';
import JSZip from 'jszip';
import 'molstar/build/viewer/molstar.css';
import './AfEvaluate.css';

const BASE_URL = 'https://opm-back.cc.lehigh.edu/membranome-backend';
const SUBMIT_ENDPOINT = `${BASE_URL}/af_evaluate`;
const STATUS_ENDPOINT = `${BASE_URL}/af_evaluate/status`;
const POLL_INTERVAL_MS = 5000;
const CYS_MODEL_COLOR = Color(0xe24a4a);
const CYS_PDB_COLOR = Color(0x2f6fff);
const FINISHED_STATES = ['complete', 'completed', 'done', 'finished', 'failed', 'error'];

function AfEvaluate() {
  const viewerContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const viewerInitRef = useRef(null);
  const pollerRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const [selectedArchive, setSelectedArchive] = useState(null);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState([]);
  const [folderHasMap, setFolderHasMap] = useState(false);
  const [mapCodesText, setMapCodesText] = useState('');
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState('');

  const [results, setResults] = useState([]);
  const [assetFiles, setAssetFiles] = useState([]);
  const [modelAlignmentMatrices, setModelAlignmentMatrices] = useState([]);
  const [logContents, setLogContents] = useState('');
  const [resultsError, setResultsError] = useState('');
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [resultsJobId, setResultsJobId] = useState('');
  const [selectedResultIndex, setSelectedResultIndex] = useState(null);
  const [selectedAlignmentIndex, setSelectedAlignmentIndex] = useState(null);
  const [jobIdInput, setJobIdInput] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const stopPolling = () => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      stopPolling();
      viewerInitRef.current = null;
      if (viewerRef.current?.plugin?.destroy) {
        viewerRef.current.plugin.destroy();
      }
      viewerRef.current = null;
    },
    []
  );

  const clearViewer = useCallback(async (viewer) => {
    if (!viewer) return;
    if (typeof viewer.clear === 'function') {
      await viewer.clear();
    } else if (viewer.plugin?.clear) {
      viewer.plugin.clear();
    }
  }, []);

  const getErrorMessage = useCallback(async (response, fallback) => {
    const errText = (await response.text()) || response.statusText;
    return errText || fallback;
  }, []);

  const ensureViewer = useCallback(async () => {
    if (viewerRef.current) return viewerRef.current;
    if (!viewerContainerRef.current) return null;

    if (!viewerInitRef.current) {
      viewerInitRef.current = Viewer.create(viewerContainerRef.current, {
        layoutIsExpanded: false,
        layoutShowControls: true,
        viewportShowExpand: false,
        viewportShowControls: false,
      }).catch((err) => {
        console.error('Mol* viewer init failed', err);
        setError('Could not initialize the Mol* viewer.');
        viewerInitRef.current = null;
        return null;
      });
    }

    viewerRef.current = await viewerInitRef.current;
    return viewerRef.current;
  }, []);

  const hideWaters = useCallback(async (viewer) => {
    if (!viewer) return;
    const structures = viewer.plugin?.managers?.structure?.hierarchy?.current?.structures || [];
    if (!structures.length) return;

    await viewer.plugin.dataTransaction(async (ctx) => {
      const getLoci = async (structure) => {
        const selection = await StructureSelectionQueries.water.getSelection(viewer.plugin, ctx, structure);
        return StructureSelection.toLociWithSourceUnits(selection);
      };

      for (const structureRef of structures) {
        await setStructureTransparency(viewer.plugin, structureRef.components, 1, getLoci);
      }
    }, { canUndo: 'Hide Water' });
  }, []);

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  };

  const getAssetName = useCallback((asset) => {
    if (!asset) return '';
    if (asset.name) return String(asset.name);
    const source = asset.url || asset.path || '';
    if (!source) return '';
    const parts = String(source).split('/');
    return parts[parts.length - 1] || '';
  }, []);

  const buildAlignmentAssetName = useCallback((result, pdbId) => {
    if (!result || !pdbId) return '';
    const parentDir = String(result.parent_dir || '').trim();
    const modelNumber = String(result.model_number ?? '').trim();
    const pdb = String(pdbId || '').trim();
    if (!parentDir || modelNumber === '' || !pdb) return '';
    return `${parentDir}_model_${modelNumber}_vs_${pdb}.pdb`;
  }, []);

  const buildReferenceAssetName = useCallback((result, pdbId) => {
    if (!result || !pdbId) return '';
    const parentDir = String(result.parent_dir || '').trim();
    const pdb = String(pdbId || '').trim();
    if (!parentDir || !pdb) return '';
    return `${parentDir}_ref_${pdb}.pdb`;
  }, []);

  const isMapFile = (file) => {
    if (!file) return false;
    const relPath = file.webkitRelativePath || file.name || '';
    const normalized = normalizeValue(relPath);
    return normalized.endsWith('/map.txt') || normalized === 'map.txt';
  };

  const getRelativePathWithoutRoot = (file) => {
    if (!file) return '';
    const relPath = file.webkitRelativePath || file.name || '';
    const parts = relPath.split('/');
    return parts.length > 1 ? parts.slice(1).join('/') : parts[0];
  };

  const getRootFolderName = (files) => {
    if (!files || !files.length) return '';
    const sample = files[0];
    if (!sample?.webkitRelativePath) return '';
    const parts = sample.webkitRelativePath.split('/');
    return parts.length ? parts[0] : '';
  };

  const buildMapFileFromCodes = (files, codesText) => {
    const fileNames = Array.from(files || [])
      .filter((file) => file && !isMapFile(file))
      .map((file) => getRelativePathWithoutRoot(file))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    if (!fileNames.length) {
      throw new Error('No files found in the selected folder to include in map.txt.');
    }

    const codes = (codesText || '')
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!codes.length) {
      throw new Error('Please provide at least one UniProt code to build map.txt.');
    }

    if (!(codes.length === 1 || codes.length === fileNames.length)) {
      throw new Error(
        `Provide either one code for all files or ${fileNames.length} codes (one per file) to build map.txt.`
      );
    }

    const lines = fileNames.map((name, index) => {
      const code = codes.length === 1 ? codes[0] : codes[index];
      return `${name} ${code}`;
    });

    const content = `${lines.join('\n')}\n`;
    return new File([content], 'map.txt', { type: 'text/plain' });
  };

  const zipFolderWithMap = async (files, mapFile) => {
    const zip = new JSZip();
    const rootName = getRootFolderName(files) || 'upload';

    const addFileToZip = async (file) => {
      if (!file) return;
      const relPath = getRelativePathWithoutRoot(file);
      if (!relPath) return;
      const data = await file.arrayBuffer();
      zip.file(relPath, data);
    };

    // Add all original files except any existing map that will be replaced.
    for (const file of files) {
      if (isMapFile(file) && mapFile) {
        continue;
      }
      await addFileToZip(file);
    }

    if (mapFile) {
      await addFileToZip(mapFile);
    }

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
    });
    const name = `${rootName || 'upload'}.zip`;
    return new File([blob], name, { type: 'application/zip' });
  };

  const buildCysteineExpression = useCallback(() => {
    const residueTest = MS.core.logic.or([
      MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), 'CYS']),
      MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_comp_id(), 'CYS']),
    ]);
    return MS.struct.generator.atomGroups({
      'entity-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.entityType(), 'polymer']),
      'residue-test': residueTest,
    });
  }, []);

  const getAlignmentsFromResult = useCallback((result) => {
    if (!result) return [];

    const alignments = [];
    Object.keys(result).forEach((key) => {
      const match = key.match(/^_pdb(\d+)$/);
      if (match && result[key]) {
        const index = match[1];
        alignments.push({
          pdbId: result[key],
          overlap: result[`_overlap${index}`],
          nsub: result[`_nsub_over${index}`],
          rmsd: result[`_rmsd${index}`],
        });
      }
    });

    return alignments;
  }, []);

  const getBestRmsd = useCallback(
    (result) => {
      const alignments = getAlignmentsFromResult(result);
      let best = null;
      alignments.forEach((alignment) => {
        const value = alignment?.rmsd;
        const numeric = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numeric)) return;
        if (best === null || numeric < best) {
          best = numeric;
        }
      });
      return best;
    },
    [getAlignmentsFromResult]
  );

  const getModelLabel = (result) => {
    if (!result) return 'Model';
    const parent = result.parent_dir ? String(result.parent_dir).trim() : '';
    const modelNumber = result.model_number ? String(result.model_number).trim() : '';
    if (parent) return parent;
    if (modelNumber) return `Model ${modelNumber}`;
    return 'Model';
  };

  const getPdbLabel = (alignment) => {
    if (!alignment) return 'PDB';
    const pdbId = alignment.pdbId ? String(alignment.pdbId).trim() : '';
    if (pdbId) return pdbId;
    const fallback = alignment.referenceName ? String(alignment.referenceName).trim() : '';
    return fallback || 'PDB';
  };

  const stripPdbHeaderIdCode = (data) => {
    if (!data || typeof data !== 'string') return data;
    const match = data.match(/^HEADER.*$/m);
    if (!match) return data;
    const headerLine = match[0];
    const padded = headerLine.padEnd(66, ' ');
    const sanitized = `${padded.slice(0, 62)}    ${padded.slice(66)}`;
    return data.replace(headerLine, sanitized);
  };

  const parseMatrixCsv = (csv) => {
    if (!csv || typeof csv !== 'string') return null;
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const header = lines[0].split(',').map((entry) => entry.trim());
    const labels = header.slice(1).map((label, index) => label || `model_${index + 1}`);
    const rowLabels = [];
    const matrix = lines.slice(1).map((line, rowIndex) => {
      const cols = line.split(',').map((entry) => entry.trim());
      rowLabels.push(cols[0] || labels[rowIndex] || `model_${rowIndex + 1}`);
      return cols.slice(1).map((value) => {
        if (value === '') return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : value;
      });
    });
    return { labels, rowLabels, matrix };
  };

  const getMatrixData = (matrixEntry) => {
    const csvData = parseMatrixCsv(matrixEntry?.csv);
    const rawLabels = Array.isArray(matrixEntry?.labels) ? matrixEntry.labels : [];
    const labels = rawLabels.length
      ? rawLabels.map((label, index) => String(label || `model_${index + 1}`))
      : csvData?.labels || [];
    const rawMatrix = Array.isArray(matrixEntry?.matrix) ? matrixEntry.matrix : [];
    const matrix = rawMatrix.length ? rawMatrix : csvData?.matrix || [];
    const rowLabels =
      csvData?.rowLabels && csvData.rowLabels.length === labels.length
        ? csvData.rowLabels
        : labels;
    return { labels, rowLabels, matrix };
  };

  const formatMatrixValue = (value) => {
    if (value === null || value === undefined) return '-';
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(numeric)) {
      const rounded = Math.round(numeric * 100) / 100;
      const text = rounded.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      return text;
    }
    return String(value);
  };

  const findReferenceAsset = useCallback(
    (result, pdbId, assetsOverride) => {
      const assets = Array.isArray(assetsOverride) ? assetsOverride : assetFiles;
      if (!assets.length) return null;
      const expectedName = buildReferenceAssetName(result, pdbId);
      if (!expectedName) return null;
      const target = normalizeValue(expectedName);
      return assets.find((file) => normalizeValue(getAssetName(file)) === target) || null;
    },
    [assetFiles, normalizeValue, getAssetName, buildReferenceAssetName]
  );

  const findAlignmentAsset = useCallback(
    (result, pdbId, assetsOverride) => {
      const assets = Array.isArray(assetsOverride) ? assetsOverride : assetFiles;
      if (!assets.length) return null;
      const expectedName = buildAlignmentAssetName(result, pdbId);
      if (!expectedName) return null;
      const target = normalizeValue(expectedName);
      return assets.find((file) => normalizeValue(getAssetName(file)) === target) || null;
    },
    [assetFiles, normalizeValue, getAssetName, buildAlignmentAssetName]
  );

  const relabelLastStructure = (viewer, label) => {
    if (!viewer || !label) return;
    const entryLabel = String(label).trim();
    if (!entryLabel) return;

    const structures = viewer.plugin?.managers?.structure?.hierarchy?.current?.structures || [];
    if (!structures.length) return;

    const target = structures[structures.length - 1];
    const modelData = target?.model?.cell?.obj?.data;

    if (modelData) {
      modelData.entryId = entryLabel;
      modelData.label = entryLabel;
      modelData.entry = entryLabel;
    }

    if (target?.model?.cell?.obj) {
      target.model.cell.obj.label = entryLabel;
    }

    if (target?.cell?.obj) {
      target.cell.obj.label = entryLabel;
    }
  };

  const addCysteineRepresentation = useCallback(async (viewer, { color, label } = {}) => {
    if (!viewer || !color) return;
    const structures = viewer?.plugin?.managers?.structure?.hierarchy?.current?.structures || [];
    if (!structures.length) return;
    const target = structures[structures.length - 1];
    if (!target?.cell) return;

    try {
      const expression = buildCysteineExpression();
      const componentLabel = label ? `cys-${label}` : 'cys';
      const component = await viewer.plugin.builders.structure.tryCreateComponentFromExpression(
        target.cell,
        expression,
        componentLabel
      );

      if (!component?.cell) return;

      await viewer.plugin.builders.structure.representation.addRepresentation(
        component.cell,
        {
          type: 'ball-and-stick',
          typeParams: {
            visuals: ['intra-bond', 'inter-bond'],
            sizeFactor: 0.5,
          },
          color: 'uniform',
          colorParams: { value: color },
        },
        { tag: componentLabel }
      );

      await viewer.plugin.builders.structure.representation.addRepresentation(
        component.cell,
        {
          type: 'label',
          typeParams: {
            level: 'residue',
            residueScale: 1.2,
            background: true,
            backgroundColor: Color(0x0d1520),
            backgroundOpacity: 0.6,
          },
          color: 'uniform',
          colorParams: { value: color },
        },
        { tag: `${componentLabel}-labels` }
      );
    } catch (err) {
      console.warn('Mol* cysteine highlight failed', err);
    }
  }, [buildCysteineExpression]);

  const getAlignmentsWithAssets = useCallback(
    (result, assetsOverride) => {
      const alignments = getAlignmentsFromResult(result);
      return alignments.map((alignment) => {
        const asset = findAlignmentAsset(result, alignment.pdbId, assetsOverride);
        const referenceAsset = findReferenceAsset(result, alignment.pdbId, assetsOverride);
        return {
          ...alignment,
          assetUrl: asset?.url || '',
          assetName: asset?.name || '',
          referenceUrl: referenceAsset?.url || '',
          referenceName: referenceAsset?.name || '',
        };
      });
    },
    [getAlignmentsFromResult, findAlignmentAsset, findReferenceAsset]
  );

  const loadAlignmentStructure = useCallback(
    async (alignment, result, assetsOverride) => {
      if (!alignment) return;
      const viewer = await ensureViewer();
      if (!viewer) return;

      try {
        await clearViewer(viewer);

        const loadPdbWithLabel = async (
          url,
          label,
          { overrideEntryId, cysteineColor, cysteineLabel } = {}
        ) => {
          if (!url) {
            throw new Error('Missing backend PDB URL.');
          }
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch PDB (${response.status})`);
          }
          let data = await response.text();
          if (overrideEntryId) {
            data = stripPdbHeaderIdCode(data);
          }
          await viewer.loadStructureFromData(data, 'pdb', { dataLabel: label });
          await addCysteineRepresentation(viewer, {
            color: cysteineColor,
            label: cysteineLabel,
          });
          await hideWaters(viewer);
        };

        const modelAsset = alignment.assetUrl
          ? { url: alignment.assetUrl, name: alignment.assetName }
          : findAlignmentAsset(result, alignment.pdbId, assetsOverride);
        const referenceAsset = alignment.referenceUrl
          ? { url: alignment.referenceUrl, name: alignment.referenceName }
          : findReferenceAsset(result, alignment.pdbId, assetsOverride);
        if (!modelAsset?.url || !referenceAsset?.url) {
          setError('Missing aligned model or reference PDB in backend response.');
          return;
        }
        const modelLabel = getModelLabel(result);

        await loadPdbWithLabel(modelAsset.url, modelLabel, {
          overrideEntryId: true,
          cysteineColor: CYS_MODEL_COLOR,
          cysteineLabel: 'model',
        });
        relabelLastStructure(viewer, modelLabel);

        const referenceLabel = getPdbLabel(alignment);
        await loadPdbWithLabel(referenceAsset.url, referenceLabel, {
          overrideEntryId: true,
          cysteineColor: CYS_PDB_COLOR,
          cysteineLabel: 'pdb',
        });
        relabelLastStructure(viewer, referenceLabel);
      } catch (err) {
        console.error('Mol* load alignment failed', err);
        setError('Could not load selected structure into the viewer.');
      }
    },
    [
      ensureViewer,
      clearViewer,
      findAlignmentAsset,
      findReferenceAsset,
      addCysteineRepresentation,
      hideWaters,
    ]
  );

  const fetchResults = useCallback(
    async (jobIdToFetch) => {
      if (!jobIdToFetch) return;
      setResultsJobId(jobIdToFetch);
      setIsFetchingResults(true);
      setResultsError('');

      try {
        const response = await fetch(
          `${BASE_URL}/af_evaluate/${encodeURIComponent(jobIdToFetch)}/results`
        );
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Could not fetch results.'));
        }

        const data = await response.json();
        const parsedResults = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.status?.results)
          ? data.status.results
          : [];
        const parsedLog = data.log_contents || data.status?.log_contents || '';
        const baseUrl = String(data.asset_base_url || data.status?.asset_base_url || '').replace(
          /\/+$/,
          ''
        );
        const rawAssets = [
          ...(Array.isArray(data.asset_files) ? data.asset_files : []),
          ...(Array.isArray(data.status?.asset_files) ? data.status.asset_files : []),
        ];
        const assetMap = new Map();
        rawAssets.forEach((asset) => {
          if (!asset) return;
          const name = getAssetName(asset);
          if (!name) return;
          const url = asset.url ? String(asset.url) : baseUrl ? `${baseUrl}/${name}` : '';
          const key = normalizeValue(name);
          const existing = assetMap.get(key);
          if (!existing || (!existing.url && url)) {
            assetMap.set(key, { ...asset, name, url });
          }
        });
        const parsedAssets = Array.from(assetMap.values());
        const parsedMatrices = Array.isArray(data.model_alignment_matrices)
          ? data.model_alignment_matrices
          : Array.isArray(data.status?.model_alignment_matrices)
          ? data.status.model_alignment_matrices
          : [];

        setResults(parsedResults);
        setAssetFiles(parsedAssets);
        setModelAlignmentMatrices(parsedMatrices);
        setLogContents(parsedLog);

        if (parsedResults.length) {
          const firstAlignments = getAlignmentsWithAssets(parsedResults[0], parsedAssets);
          setSelectedResultIndex(0);
          setSelectedAlignmentIndex(firstAlignments.length ? 0 : null);
          if (firstAlignments[0]) {
            loadAlignmentStructure(firstAlignments[0], parsedResults[0], parsedAssets);
          }
        } else {
          setSelectedResultIndex(null);
          setSelectedAlignmentIndex(null);
        }
      } catch (err) {
        setResultsError(err?.message || 'Could not load results for this job.');
      } finally {
        setIsFetchingResults(false);
      }
    },
    [getAlignmentsWithAssets, loadAlignmentStructure, getErrorMessage, getAssetName, normalizeValue]
  );

  const fetchStatusOnce = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`${STATUS_ENDPOINT}?job_id=${encodeURIComponent(id)}`);
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not fetch job status.'));
      }
      const data = await response.json();
      const statusFromApi = data.status || data.state || 'unknown';
      setStatus(statusFromApi);
      setLastCheckedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        err?.message ? `Could not fetch job status: ${err.message}` : 'Could not fetch job status.'
      );
      setLastCheckedAt(new Date().toLocaleTimeString());
    }
  }, [getErrorMessage]);

  const handleFetchExistingResults = async () => {
    const id = jobIdInput.trim();
    if (!id) {
      setResultsError('Enter a job_id to load results.');
      return;
    }
    stopPolling();
    setJobId(id);
    setError('');
    setStatus('');
    setResultsError('');
    setLastCheckedAt('');
    setResultsJobId(id);
    await fetchStatusOnce(id);
    await fetchResults(id);
  };

  const downloadResultsArchive = async () => {
    const id = (jobIdInput || jobId || '').trim();
    if (!id) {
      setResultsError('Enter a job_id to download results.');
      return;
    }
    setResultsError('');
    setIsDownloading(true);
    try {
      const response = await fetch(`${BASE_URL}/af_evaluate/${encodeURIComponent(id)}/download`);
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not download results.'));
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${id}.tar.gz`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setResultsError(err?.message || 'Could not download results.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadMatrixCsv = (group) => {
    if (!group?.csv) return;
    const blob = new Blob([group.csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = String(group.parent_dir || 'matrix').replace(/[^a-z0-9._-]+/gi, '_');
    link.href = url;
    link.download = `${safeName}_matrix.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const selectAlignmentAt = useCallback(
    (resultIndex, alignmentIndex) => {
      const result = results[resultIndex];
      if (!result) return;
      const alignments = getAlignmentsWithAssets(result);
      if (!alignments.length) {
        setSelectedResultIndex(resultIndex);
        setSelectedAlignmentIndex(null);
        return;
      }
      const safeIndex = Math.max(0, Math.min(alignmentIndex, alignments.length - 1));
      const alignment = alignments[safeIndex];
      setSelectedResultIndex(resultIndex);
      setSelectedAlignmentIndex(safeIndex);
      loadAlignmentStructure(alignment, result);
    },
    [results, getAlignmentsWithAssets, loadAlignmentStructure]
  );

  const handleSelectResult = (index) => {
    if (!results[index]) return;
    selectAlignmentAt(index, 0);
  };

  const handleSelectAlignment = (alignment, index) => {
    if (selectedResultIndex === null) return;
    setSelectedAlignmentIndex(index);
    if (alignment) {
      const result = results[selectedResultIndex];
      loadAlignmentStructure(alignment, result);
    }
  };

  const findNextAlignmentTarget = useCallback(
    (direction) => {
      if (!results.length) return null;
      const currentResultIndex = selectedResultIndex ?? 0;
      const currentAlignments = results[currentResultIndex]
        ? getAlignmentsWithAssets(results[currentResultIndex])
        : [];
      const currentAlignmentIndex =
        selectedAlignmentIndex !== null ? selectedAlignmentIndex : currentAlignments.length ? 0 : null;

      if (
        currentAlignments.length &&
        currentAlignmentIndex !== null &&
        currentAlignmentIndex + direction >= 0 &&
        currentAlignmentIndex + direction < currentAlignments.length
      ) {
        return {
          resultIndex: currentResultIndex,
          alignmentIndex: currentAlignmentIndex + direction,
        };
      }

      let nextResultIndex = currentResultIndex + direction;
      while (nextResultIndex >= 0 && nextResultIndex < results.length) {
        const nextAlignments = getAlignmentsWithAssets(results[nextResultIndex]);
        if (nextAlignments.length) {
          return {
            resultIndex: nextResultIndex,
            alignmentIndex: direction > 0 ? 0 : nextAlignments.length - 1,
          };
        }
        nextResultIndex += direction;
      }

      return null;
    },
    [results, selectedResultIndex, selectedAlignmentIndex, getAlignmentsWithAssets]
  );

  const handlePrevResult = () => {
    const target = findNextAlignmentTarget(-1);
    if (!target) return;
    selectAlignmentAt(target.resultIndex, target.alignmentIndex);
  };

  const handleNextResult = () => {
    const target = findNextAlignmentTarget(1);
    if (!target) return;
    selectAlignmentAt(target.resultIndex, target.alignmentIndex);
  };

  const selectedResult = selectedResultIndex !== null ? results[selectedResultIndex] : null;
  const selectedResultAlignments = selectedResult ? getAlignmentsWithAssets(selectedResult) : [];
  const alignmentCount = selectedResultAlignments.length;
  const alignmentPosition = selectedAlignmentIndex !== null ? selectedAlignmentIndex + 1 : 0;
  const canGoPrev = Boolean(findNextAlignmentTarget(-1));
  const canGoNext = Boolean(findNextAlignmentTarget(1));
  const selectedParentDir = selectedResult?.parent_dir
    ? normalizeValue(selectedResult.parent_dir)
    : '';

  const baseColumns = [
    'parent_dir',
    'model_number',
    'pLDDT',
    'pTM',
    'ipTM',
    'ss_matched',
    'ss_missing',
    'ss_extra',
    'ss_interchain',
  ];

  const availableColumns = baseColumns.filter((col) => results.some((row) => row[col] !== undefined));
  const resultColumns = [...availableColumns, 'bestRMSD', 'alignments'];
  const selectedFolderName = selectedFolderFiles.length
    ? getRootFolderName(selectedFolderFiles) || 'Selected folder'
    : '';
  const folderFileCountWithoutMap = selectedFolderFiles.filter((file) => !isMapFile(file)).length;

  const handleArchiveChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedArchive(null);
      setSelectedFolderFiles([]);
      setFolderHasMap(false);
      setMapCodesText('');
      setError('');
      return;
    }

    setError('');

    const isArchive = /\.(tar|tar\.gz|tgz|zip)$/i.test(file.name);

    if (!isArchive) {
      setError('Unsupported file type. Please choose a single .tar/.tar.gz/.tgz/.zip archive.');
      setSelectedArchive(null);
      return;
    }

    setSelectedArchive(file);
    setSelectedFolderFiles([]);
    setFolderHasMap(false);
    setMapCodesText('');
  };

  const handleFolderChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setSelectedFolderFiles([]);
      setFolderHasMap(false);
      setSelectedArchive(null);
      setMapCodesText('');
      setError('');
      return;
    }

    setError('');
    setSelectedArchive(null);
    setSelectedFolderFiles(files);
    const hasMap = files.some(isMapFile);
    setFolderHasMap(hasMap);
    if (hasMap) {
      setMapCodesText('');
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openFolderPicker = () => {
    folderInputRef.current?.click();
  };

  const prepareUploadFile = async () => {
    if (selectedArchive) return selectedArchive;

    if (selectedFolderFiles.length) {
      const existingMap = selectedFolderFiles.find(isMapFile) || null;
      let mapFileToUse = existingMap;

      if (!existingMap) {
        mapFileToUse = buildMapFileFromCodes(selectedFolderFiles, mapCodesText);
      }

      return zipFolderWithMap(selectedFolderFiles, mapFileToUse);
    }

    return null;
  };

  const submitJob = async (event) => {
    event.preventDefault();
    if (!selectedArchive && !selectedFolderFiles.length) {
      setError('Please choose an archive or folder before submitting.');
      return;
    }

    setResults([]);
    setAssetFiles([]);
    setModelAlignmentMatrices([]);
    setLogContents('');
    setResultsJobId('');
    setResultsError('');
    setSelectedResultIndex(null);
    setSelectedAlignmentIndex(null);

    stopPolling();
    setIsSubmitting(true);
    setError('');

    let uploadFile;
    try {
      uploadFile = await prepareUploadFile();
      if (!uploadFile) {
        throw new Error('No upload data found. Please re-select your file or folder.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Could not prepare the upload payload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile, uploadFile.name);

    try {
      const response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const statusLine = `${response.status} ${response.statusText}`.trim();
        const rawErrorText = (await response.text()) || '';

        if (response.status === 413) {
          throw new Error(
            'Upload rejected (413 Request Entity Too Large). Please reduce the upload size or increase the server limit.'
          );
        }

        const cleanedText = rawErrorText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        throw new Error(cleanedText || statusLine || 'Upload failed. Please try again.');
      }

      const data = await response.json();
      const returnedJobId = data.job_id || data.jobId;

      if (!returnedJobId) {
        throw new Error('The backend did not return a job_id.');
      }

      setJobId(returnedJobId);
      setJobIdInput(returnedJobId);
      setStatus(data.status || 'submitted');
      startPolling(returnedJobId);
    } catch (err) {
      setError(err.message || 'Something went wrong while submitting the job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPolling = (id) => {
    if (!id) return;

    const poll = async () => {
      try {
        const response = await fetch(`${STATUS_ENDPOINT}?job_id=${encodeURIComponent(id)}`);
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Status request failed.'));
        }

        const data = await response.json();
        const statusFromApi = data.status || data.state || 'running';
        setStatus(statusFromApi);
        setLastCheckedAt(new Date().toLocaleTimeString());

        const normalized = String(statusFromApi || '').toLowerCase();
        if (FINISHED_STATES.includes(normalized)) {
          stopPolling();
        }
      } catch (err) {
        setError(
          err?.message
            ? `Could not check job status: ${err.message}`
            : 'Could not check job status. Will keep trying.'
        );
        setLastCheckedAt(new Date().toLocaleTimeString());
      }
    };

    poll();
    pollerRef.current = setInterval(poll, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    const normalized = String(status || '').toLowerCase();
    if (!jobId || !FINISHED_STATES.slice(0, 4).includes(normalized)) return;
    if (resultsJobId === jobId || isFetchingResults) return;
    fetchResults(jobId);
  }, [status, jobId, resultsJobId, isFetchingResults, fetchResults]);

  return (
    <div className="af-evaluate-page">
      <div className="af-evaluate-header">
        <div>
          <p className="af-kicker">AlphaFold evaluation</p>
          <h1>AF Evaluate</h1>
          <p className="af-subtitle">
            Upload a compressed archive (.tar/.tar.gz/.tgz/.zip) or an uncompressed folder. If map.txt is missing, enter
            UniProt codes and we will build it before sending your data. The viewer loads aligned models and references
            after results are available.
          </p>
        </div>
        <div className="af-status-card">
          <p className="af-status-label">Job status</p>
          <p className="af-status-value">{status || 'No job started'}</p>
          {jobId && <p className="af-status-meta">job_id: {jobId}</p>}
          {lastCheckedAt && <p className="af-status-meta">Last checked: {lastCheckedAt}</p>}
        </div>
      </div>

      <div className="af-evaluate-grid">
        <div className="af-panel af-panel-form">
          <div className="af-panel-header">
            <div>
              <p className="af-kicker">Upload</p>
              <h2>Submit to backend</h2>
            </div>
          </div>
          <form className="af-form" onSubmit={submitJob}>
            <label className="af-label" htmlFor="af-file-input">
              Input archive or folder
            </label>
            <div className="af-file-actions">
              <button type="button" className="af-file-btn" onClick={openFilePicker}>
                Select archive (.tar/.tar.gz/.tgz/.zip)
              </button>
              <button type="button" className="af-file-btn" onClick={openFolderPicker}>
                Select folder (uncompressed)
              </button>
            </div>
            <input
              id="af-file-input"
              ref={fileInputRef}
              type="file"
              accept=".tar,.tar.gz,.tgz,.zip"
              onChange={handleArchiveChange}
              className="af-file-input-hidden"
            />
            <input
              id="af-folder-input"
              ref={folderInputRef}
              type="file"
              multiple
              webkitdirectory="true"
              onChange={handleFolderChange}
              className="af-file-input-hidden"
            />
            <p className="af-helper-text">
              Upload exactly one archive or pick a folder. If map.txt is missing, provide UniProt codes and we will add the
              file before sending to the backend.
            </p>
            {selectedArchive && (
              <ul className="af-file-list">
                <li>{selectedArchive.name}</li>
              </ul>
            )}
            {selectedFolderFiles.length > 0 && (
              <div className="af-folder-summary">
                <ul className="af-file-list">
                  <li>
                    {selectedFolderName} ({selectedFolderFiles.length} file
                    {selectedFolderFiles.length !== 1 ? 's' : ''}){' '}
                    {folderHasMap ? '• map.txt found' : '• map.txt will be created'}
                  </li>
                </ul>
                {!folderHasMap && (
                  <>
                    <label className="af-label" htmlFor="af-map-codes">
                      UniProt codes for map.txt
                    </label>
                    <textarea
                      id="af-map-codes"
                      className="af-map-textarea"
                      rows={4}
                      value={mapCodesText}
                      onChange={(e) => setMapCodesText(e.target.value)}
                      placeholder="One UniProt code per line"
                    />
                    <p className="af-helper-text">
                      Enter one code to apply to all files
                      {folderFileCountWithoutMap > 1
                        ? ` or provide ${folderFileCountWithoutMap} codes (one per file).`
                        : '.'}
                    </p>
                  </>
                )}
              </div>
            )}
            <button className="af-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Upload & Start'}
            </button>
            <div className="af-log-section">
              <details>
                <summary className="af-label">Show logs</summary>
                {logContents ? (
                  <pre className="af-log-content">{logContents}</pre>
                ) : (
                  <p className="af-helper-text">No logs returned for this job.</p>
                )}
              </details>
            </div>
            {error && <p className="af-error">{error}</p>}
          </form>
        </div>

        <div className="af-panel af-panel-viewer">
          <div className="af-panel-header">
            <div>
              <p className="af-kicker">3D Viewer</p>
              <h2>Mol* preview</h2>
            </div>
            <span className="af-tag">PDB</span>
          </div>
          <div className="af-cysteine-legend">
            <span className="af-cysteine-legend-item">
              <span className="af-cysteine-swatch af-cysteine-swatch-model" />
              Model cysteines
            </span>
            <span className="af-cysteine-legend-item">
              <span className="af-cysteine-swatch af-cysteine-swatch-pdb" />
              PDB cysteines
            </span>
          </div>
          <div className="af-viewer">
            <div ref={viewerContainerRef} className="af-viewer-embed" />
          </div>
          <p className="af-helper-text">
            Select an archive or folder to send to the backend. The viewer loads aligned models and references from the
            results.
          </p>
        </div>

        <div className="af-panel af-panel-results">
          <div className="af-panel-header">
            <div>
              <p className="af-kicker">Results</p>
              <h2>Evaluation output</h2>
            </div>
            {jobId && <span className="af-tag">job: {jobId.length > 8 ? `${jobId.slice(0, 8)}...` : jobId}</span>}
          </div>

          {results.length > 0 && (
            <div className="af-results-nav">
              <button type="button" className="af-file-btn" onClick={handlePrevResult} disabled={!canGoPrev}>
                &lt; Prev PDB
              </button>
              <span className="af-status-meta">
                {selectedResultIndex !== null
                  ? `Result ${selectedResultIndex + 1} of ${results.length}`
                  : `Result 0 of ${results.length}`}
                {alignmentCount ? ` | PDB ${alignmentPosition} of ${alignmentCount}` : ''}
              </span>
              <button type="button" className="af-file-btn" onClick={handleNextResult} disabled={!canGoNext}>
                Next PDB &gt;
              </button>
            </div>
          )}

          <div className="af-manual-controls">
            <label className="af-label" htmlFor="af-job-id-input">
              Load previous job
            </label>
            <div className="af-job-actions">
              <input
                id="af-job-id-input"
                type="text"
                value={jobIdInput}
                onChange={(e) => setJobIdInput(e.target.value)}
                placeholder="Enter job_id"
                className="af-text-input"
              />
              <button
                type="button"
                className="af-file-btn"
                onClick={handleFetchExistingResults}
                disabled={isFetchingResults}
              >
                {isFetchingResults ? 'Loading...' : 'Load results'}
              </button>
              <button type="button" className="af-file-btn" onClick={downloadResultsArchive} disabled={isDownloading}>
                {isDownloading ? 'Downloading...' : 'Download all (.tar.gz)'}
              </button>
            </div>
            <p className="af-helper-text">Enter a job_id to retrieve results or download the full archive.</p>
          </div>

          {isFetchingResults && <p className="af-status-meta">Loading results...</p>}
          {resultsError && (
            <div className="af-error-block">
              <p className="af-error">{resultsError}</p>
              {jobId && (
                <button type="button" className="af-file-btn" onClick={() => fetchResults(jobId)} disabled={isFetchingResults}>
                  Retry results fetch
                </button>
              )}
            </div>
          )}
          {!isFetchingResults && !results.length && !resultsError && (
            <p className="af-helper-text">Results will appear here after the job finishes.</p>
          )}

          {results.length > 0 && (
            <>
              <div className="af-results-table-wrapper">
                <table className="af-results-table">
                  <thead>
                    <tr>
                      {resultColumns.map((col) => (
                        <th key={col}>{col === 'alignments' ? 'Alignments' : col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, rowIndex) => {
                      const alignments = getAlignmentsFromResult(row);
                      const isSelected = rowIndex === selectedResultIndex;
                      return (
                        <tr
                          key={rowIndex}
                          onClick={() => handleSelectResult(rowIndex)}
                          style={isSelected ? { backgroundColor: '#f4f7ff' } : undefined}
                        >
                          {resultColumns.map((col) => (
                            <td key={`${col}-${rowIndex}`}>
                              {col === 'alignments'
                                ? alignments.map((a) => a.pdbId).filter(Boolean).join(', ') || '-'
                                : col === 'bestRMSD'
                                ? formatMatrixValue(getBestRmsd(row))
                                : row[col] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="af-alignments-section">
                <p className="af-label">
                  Alignments &amp; structures
                  {selectedResult?.parent_dir ? ` - ${selectedResult.parent_dir}` : ''}
                </p>

                {!selectedResultAlignments.length && (
                  <p className="af-helper-text">Select a row in the table to choose alignments to view.</p>
                )}

                {selectedResultAlignments.length > 0 && (
                  <div className="af-alignment-list">
                    {selectedResultAlignments.map((alignment, idx) => {
                      const isActive = idx === selectedAlignmentIndex;
                      const metaParts = [];
                      if (alignment.rmsd) metaParts.push(`RMSD ${alignment.rmsd}`);
                      if (alignment.overlap) metaParts.push(`overlap ${alignment.overlap}`);
                      if (alignment.nsub) metaParts.push(`nsub ${alignment.nsub}`);

                      return (
                        <button
                          type="button"
                          key={alignment.pdbId || idx}
                          className="af-alignment-btn"
                          onClick={() => handleSelectAlignment(alignment, idx)}
                          style={
                            isActive
                              ? { backgroundColor: '#e7eefc', borderColor: '#4c6fff' }
                              : { backgroundColor: '#f7f7f9', borderColor: '#d4d7dd' }
                          }
                        >
                          <span>{alignment.pdbId || 'Alignment'}</span>
                          {metaParts.length > 0 && <span className="af-alignment-meta">({metaParts.join(' | ')})</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>

              <div className="af-matrix-section">
                <p className="af-label">Model alignment matrices</p>
                {modelAlignmentMatrices.length > 0 ? (
                  <>
                    <div className="af-matrix-legend">
                      <span className="af-matrix-legend-item">
                        <span className="af-matrix-legend-swatch af-matrix-legend-upper" />
                        Upper triangle: RMSD
                      </span>
                      <span className="af-matrix-legend-item">
                        <span className="af-matrix-legend-swatch af-matrix-legend-lower" />
                        Lower triangle: overlap
                      </span>
                    </div>
                    {modelAlignmentMatrices.map((group, groupIndex) => {
                      const { labels, rowLabels, matrix } = getMatrixData(group);
                      const groupKey = group?.parent_dir || `matrix-${groupIndex}`;
                      const isActive =
                        selectedParentDir && normalizeValue(group?.parent_dir) === selectedParentDir;

                      return (
                        <div
                          key={groupKey}
                          className={`af-matrix-group${isActive ? ' is-active' : ''}`}
                        >
                          <div className="af-matrix-header">
                            <p className="af-matrix-title">{group?.parent_dir || 'Models'}</p>
                            {group?.csv && (
                              <button
                                type="button"
                                className="af-file-btn af-matrix-btn"
                                onClick={() => downloadMatrixCsv(group)}
                              >
                                Download CSV
                              </button>
                            )}
                          </div>
                          <div className="af-matrix-wrapper">
                            <table className="af-matrix-table">
                              <thead>
                                <tr>
                                  <th scope="col" />
                                  {labels.map((label, labelIndex) => (
                                    <th scope="col" key={`${groupKey}-col-${labelIndex}`}>
                                      {label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {labels.map((_, rowIndex) => {
                                  const rowLabel = rowLabels[rowIndex] || labels[rowIndex] || `model_${rowIndex + 1}`;
                                  const row = Array.isArray(matrix[rowIndex]) ? matrix[rowIndex] : [];
                                  return (
                                    <tr key={`${groupKey}-row-${rowIndex}`}>
                                      <th scope="row">{rowLabel}</th>
                                      {labels.map((_, colIndex) => {
                                        const value = row[colIndex];
                                        const isDiagonal = rowIndex === colIndex;
                                        const cellType = isDiagonal
                                          ? 'diag'
                                          : rowIndex < colIndex
                                          ? 'upper'
                                          : 'lower';
                                        const cellValue = isDiagonal ? '-' : formatMatrixValue(value);
                                        return (
                                          <td
                                            key={`${groupKey}-cell-${rowIndex}-${colIndex}`}
                                            className={`af-matrix-cell af-matrix-cell-${cellType}`}
                                          >
                                            {cellValue}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="af-helper-text">No model alignment matrices returned for this job.</p>
                )}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AfEvaluate;
