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
      </div>
    </div>
  );
}

export default AfEvaluate;
