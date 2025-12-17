import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Viewer } from 'molstar/lib/apps/viewer/app';
import 'molstar/build/viewer/molstar.css';
import './AfEvaluate.css';

const BASE_URL = 'https://opm-back.cc.lehigh.edu/membranome-backend';
const SUBMIT_ENDPOINT = `${BASE_URL}/af_evaluate`;
const STATUS_ENDPOINT = `${BASE_URL}/af_evaluate/status`;
const POLL_INTERVAL_MS = 5000;
const SAMPLE_PDB_URL = 'https://files.rcsb.org/download/1CRN.pdb';

function AfEvaluate() {
  const viewerContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const viewerInitRef = useRef(null);
  const pollerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState('');
  const [pdbFilePreview, setPdbFilePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [resultsError, setResultsError] = useState('');
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [resultsJobId, setResultsJobId] = useState('');
  const [selectedResultIndex, setSelectedResultIndex] = useState(null);
  const [selectedAlignment, setSelectedAlignment] = useState(null);

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

  const ensureViewer = useCallback(async () => {
    if (viewerRef.current) return viewerRef.current;
    if (!viewerContainerRef.current) return null;

    if (!viewerInitRef.current) {
      viewerInitRef.current = Viewer.create(viewerContainerRef.current, {
        layoutIsExpanded: false,
        layoutShowControls: true,
        viewportShowExpand: true,
        viewportShowControls: true,
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

  const loadStructurePreview = useCallback(
    async (preview) => {
      const viewer = await ensureViewer();
      if (!viewer) return;

      if (typeof viewer.clear === 'function') {
        await viewer.clear();
      } else if (viewer.plugin?.clear) {
        viewer.plugin.clear();
      }

      try {
        if (preview?.filestring) {
          await viewer.loadStructureFromData(
            preview.filestring,
            preview.type || 'pdb'
          );
        } else {
          await viewer.loadStructureFromUrl(SAMPLE_PDB_URL, 'pdb');
        }
      } catch (err) {
        console.error('Mol* load failed', err);
        setError('Could not load structure into the viewer.');
      }
    },
    [ensureViewer]
  );

  useEffect(() => {
    loadStructurePreview(pdbFilePreview);
  }, [loadStructurePreview, pdbFilePreview]);

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

  const loadAlignmentStructure = useCallback(
    async (pdbId) => {
      if (!pdbId) return;
      const viewer = await ensureViewer();
      if (!viewer) return;

      try {
        if (typeof viewer.clear === 'function') {
          await viewer.clear();
        } else if (viewer.plugin?.clear) {
          viewer.plugin.clear();
        }

        await viewer.loadStructureFromUrl(
          `https://files.rcsb.org/download/${encodeURIComponent(pdbId)}.pdb`,
          'pdb'
        );
      } catch (err) {
        console.error('Mol* load alignment failed', err);
        setError('Could not load selected structure into the viewer.');
      }
    },
    [ensureViewer]
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
          const errText = (await response.text()) || response.statusText;
          throw new Error(errText || 'Could not fetch results.');
        }

        const data = await response.json();
        const parsedResults = Array.isArray(data.results) ? data.results : [];
        setResults(parsedResults);
        if (parsedResults.length) {
          const firstAlignments = getAlignmentsFromResult(parsedResults[0]);
          setSelectedResultIndex(0);
          setSelectedAlignment(firstAlignments[0] || null);
          if (firstAlignments[0]?.pdbId) {
            loadAlignmentStructure(firstAlignments[0].pdbId);
          }
        } else {
          setSelectedResultIndex(null);
          setSelectedAlignment(null);
        }
      } catch (err) {
        setResultsError(
          err?.message || 'Could not load results for this job.'
        );
      } finally {
        setIsFetchingResults(false);
      }
    },
    [getAlignmentsFromResult, loadAlignmentStructure]
  );

  const handleSelectResult = (index) => {
    if (!results[index]) return;
    setSelectedResultIndex(index);
    const alignments = getAlignmentsFromResult(results[index]);
    const firstAlignment = alignments[0] || null;
    setSelectedAlignment(firstAlignment);
    if (firstAlignment?.pdbId) {
      loadAlignmentStructure(firstAlignment.pdbId);
    }
  };

  const handleSelectAlignment = (alignment) => {
    setSelectedAlignment(alignment);
    if (alignment?.pdbId) {
      loadAlignmentStructure(alignment.pdbId);
    }
  };

  const selectedResult =
    selectedResultIndex !== null ? results[selectedResultIndex] : null;
  const selectedResultAlignments = selectedResult
    ? getAlignmentsFromResult(selectedResult)
    : [];

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

  const availableColumns = baseColumns.filter((col) =>
    results.some((row) => row[col] !== undefined)
  );
  const resultColumns = [...availableColumns, 'alignments'];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setError('');
      setPdbFilePreview(null);
      return;
    }

    setError('');
    setPdbFilePreview(null);

    const isArchive = /\.(tar|tar\.gz|tgz|zip)$/i.test(file.name);

    if (!isArchive) {
      setError(
        'Unsupported file type. Please choose a single .tar/.tar.gz/.tgz/.zip archive.'
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const submitJob = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please choose one file before submitting.');
      return;
    }

    setResults([]);
    setResultsJobId('');
    setResultsError('');
    setSelectedResultIndex(null);
    setSelectedAlignment(null);

    stopPolling();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

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
        const response = await fetch(
          `${STATUS_ENDPOINT}?job_id=${encodeURIComponent(id)}`
        );
        if (!response.ok) {
          const errText = (await response.text()) || response.statusText;
          throw new Error(errText || 'Status request failed.');
        }

        const data = await response.json();
        const statusFromApi = data.status || data.state || 'running';
        setStatus(statusFromApi);
        setLastCheckedAt(new Date().toLocaleTimeString());

        const normalized = String(statusFromApi || '').toLowerCase();
        if (
          ['complete', 'completed', 'done', 'finished', 'failed', 'error'].includes(
            normalized
          )
        ) {
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
    const finishedStates = ['complete', 'completed', 'done', 'finished'];
    if (!jobId || !finishedStates.includes(normalized)) return;
    if (resultsJobId === jobId || isFetchingResults) return;
    fetchResults(jobId);
  }, [status, jobId, resultsJobId, isFetchingResults, fetchResults]);

  return (
    <div className='af-evaluate-page'>
      <div className='af-evaluate-header'>
        <div>
          <p className='af-kicker'>AlphaFold evaluation</p>
          <h1>AF Evaluate</h1>
          <p className='af-subtitle'>
            Upload a single compressed archive (.tar/.tar.gz/.tgz/.zip) for backend evaluation. The viewer shows a sample structure by default.
          </p>
        </div>
        <div className='af-status-card'>
          <p className='af-status-label'>Job status</p>
          <p className='af-status-value'>{status || 'No job started'}</p>
          {jobId && <p className='af-status-meta'>job_id: {jobId}</p>}
          {lastCheckedAt && (
            <p className='af-status-meta'>Last checked: {lastCheckedAt}</p>
          )}
        </div>
      </div>

      <div className='af-evaluate-grid'>
        <div className='af-panel af-panel-form'>
          <div className='af-panel-header'>
            <div>
              <p className='af-kicker'>Upload</p>
              <h2>Submit to backend</h2>
            </div>
          </div>
          <form className='af-form' onSubmit={submitJob}>
            <label className='af-label' htmlFor='af-file-input'>
              Input archive
            </label>
            <div className='af-file-actions'>
              <button type='button' className='af-file-btn' onClick={openFilePicker}>
                Select archive (.tar/.tar.gz/.tgz/.zip)
              </button>
            </div>
            <input
              id='af-file-input'
              ref={fileInputRef}
              type='file'
              accept='.tar,.tar.gz,.tgz,.zip'
              onChange={handleFileChange}
              className='af-file-input-hidden'
            />
            <p className='af-helper-text'>
              Upload exactly one archive (.tar/.tar.gz/.tgz/.zip). It will be sent to the backend as the `file` parameter.
            </p>
            {selectedFile && (
              <ul className='af-file-list'>
                <li>{selectedFile.name}</li>
              </ul>
            )}
            <button className='af-submit-btn' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Upload & Start'}
            </button>
            {error && <p className='af-error'>{error}</p>}
          </form>
        </div>

        <div className='af-panel af-panel-viewer'>
          <div className='af-panel-header'>
            <div>
              <p className='af-kicker'>3D Viewer</p>
              <h2>Mol* preview</h2>
            </div>
            <span className='af-tag'>PDB</span>
          </div>
          <div className='af-viewer'>
            <div ref={viewerContainerRef} className='af-viewer-embed' />
          </div>
          <p className='af-helper-text'>
            Select a single archive to send to the backend. The viewer shows a sample structure.
          </p>
        </div>

        <div className='af-panel af-panel-results'>
          <div className='af-panel-header'>
            <div>
              <p className='af-kicker'>Results</p>
              <h2>Evaluation output</h2>
            </div>
            {jobId && (
              <span className='af-tag'>
                job: {jobId.length > 8 ? `${jobId.slice(0, 8)}...` : jobId}
              </span>
            )}
          </div>

          {isFetchingResults && (
            <p className='af-status-meta'>Loading results...</p>
          )}
          {resultsError && (
            <div className='af-error-block'>
              <p className='af-error'>{resultsError}</p>
              {jobId && (
                <button
                  type='button'
                  className='af-file-btn'
                  onClick={() => fetchResults(jobId)}
                  disabled={isFetchingResults}
                >
                  Retry results fetch
                </button>
              )}
            </div>
          )}
          {!isFetchingResults && !results.length && !resultsError && (
            <p className='af-helper-text'>
              Results will appear here after the job finishes.
            </p>
          )}

          {results.length > 0 && (
            <>
              <div className='af-results-table-wrapper'>
                <table className='af-results-table'>
                  <thead>
                    <tr>
                      {resultColumns.map((col) => (
                        <th key={col}>
                          {col === 'alignments'
                            ? 'Alignments'
                            : col.replace(/_/g, ' ')}
                        </th>
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
                          style={
                            isSelected ? { backgroundColor: '#f4f7ff' } : undefined
                          }
                        >
                          {resultColumns.map((col) => (
                            <td key={`${col}-${rowIndex}`}>
                              {col === 'alignments'
                                ? alignments
                                    .map((alignment) => alignment.pdbId)
                                    .filter(Boolean)
                                    .join(', ') || '-'
                                : row[col] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className='af-alignments-section'>
                <p className='af-label'>
                  Alignments & structures
                  {selectedResult?.parent_dir ? ` - ${selectedResult.parent_dir}` : ''}
                </p>

                {!selectedResultAlignments.length && (
                  <p className='af-helper-text'>
                    Select a row in the table to choose alignments to view.
                  </p>
                )}

                {selectedResultAlignments.length > 0 && (
                  <div className='af-alignment-list'>
                    {selectedResultAlignments.map((alignment, idx) => {
                      const isActive =
                        selectedAlignment?.pdbId &&
                        alignment.pdbId &&
                        selectedAlignment.pdbId === alignment.pdbId;
                      const metaParts = [];
                      if (alignment.rmsd) metaParts.push(`RMSD ${alignment.rmsd}`);
                      if (alignment.overlap) metaParts.push(`overlap ${alignment.overlap}`);
                      if (alignment.nsub) metaParts.push(`nsub ${alignment.nsub}`);

                      return (
                        <button
                          type='button'
                          key={alignment.pdbId || idx}
                          className='af-alignment-btn'
                          onClick={() => handleSelectAlignment(alignment)}
                          style={
                            isActive
                              ? { backgroundColor: '#e7eefc', borderColor: '#4c6fff' }
                              : { backgroundColor: '#f7f7f9', borderColor: '#d4d7dd' }
                          }
                        >
                          <span>{alignment.pdbId ? `PDB ${alignment.pdbId}` : 'Alignment'}</span>
                          {metaParts.length > 0 && (
                            <span className='af-alignment-meta'>({metaParts.join(' | ')})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
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
