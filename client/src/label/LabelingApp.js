import React, { Component } from 'react';
import Hotkeys from 'react-hot-keys';
import update from 'immutability-helper';

import 'semantic-ui-css/semantic.min.css';

import Canvas from './Canvas';
import HotkeysPanel from './HotkeysPanel';
import Description from './Description';
import Status from '../common/Status';
import Progress from './Progress';
import Comment from './Comment';
import Sidebar from './Sidebar';
import { PathToolbar, MakePredictionToolbar } from './CanvasToolbar';
import Reference from './Reference';
import './LabelingApp.css';

import { genId, colors } from './utils';
import { computeTrace } from './tracing';
import { withHistory } from './LabelingAppHistoryHOC';
import { withLoadImageData } from './LoadImageDataHOC';
import { withPredictions } from './MakePredictionsHOC';

/*
 type Figure = {
   type: 'bbox' | 'polygon';
   points: [{ lat: Number, lng: Number }];
   ?color: Color;
 };
*/

class LabelingApp extends Component {
  constructor(props) {
    super(props);
    const { labels, embedded } = props;
    const toggles = {};
    labels.map(label => (toggles[label.id] = true));

    this.state = {
      selected: null,
      toggles,
      embedded: embedded || false,
      selectedFigureId: null,
      focused: false,

      // UI
      reassigning: { status: false, type: null },
      hotkeysPanel: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSelected = this.handleSelected.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.canvasRef = React.createRef();
  }

  handleSelected(selected) {
    if (selected === this.state.selected) return;
    const { pushState } = this.props;
    if (!selected) {
      pushState(
        state => ({
          unfinishedFigure: null,
        }),
        () => this.setState({ selected })
      );
      return;
    }

    const { labels } = this.props;

    const labelIdx = labels.findIndex(label => label.id === selected);
    const type = labels[labelIdx].type;
    const color = colors[labelIdx];

    pushState(
      state => ({
        unfinishedFigure: {
          id: null,
          color,
          type,
          points: [],
        },
      }),
      () => this.setState({ selected })
    );
  }

  handleSelectionChange(figureId) {
    if (figureId) {
      this.setState({ selectedFigureId: figureId });
    } else {
      this.setState({
        reassigning: { status: false, type: null },
        selectedFigureId: null,
      });
    }
  }

  handleChange(eventType, figure, newLabelId) {
    if (!figure.color) return;
    const { labels, figures, pushState, height, width, imageData } = this.props;
    const label =
      figure.color === 'gray'
        ? { id: '__temp' }
        : labels[colors.indexOf(figure.color)];
    const idx = (figures[label.id] || []).findIndex(f => f.id === figure.id);

    switch (eventType) {
      case 'new':
        pushState(
          state => ({
            figures: update(state.figures, {
              [label.id]: {
                $push: [
                  {
                    id: figure.id || genId(),
                    type: figure.type,
                    points: figure.points,
                  },
                ],
              },
            }),
            unfinishedFigure: null,
          }),
          () =>
            this.setState({
              selected: null,
            })
        );
        break;

      case 'replace':
        pushState(state => {
          let { tracingOptions } = figure;
          if (tracingOptions && tracingOptions.enabled) {
            const imageInfo = {
              height,
              width,
              imageData,
            };
            tracingOptions = {
              ...tracingOptions,
              trace: computeTrace(figure.points, imageInfo, tracingOptions),
            };
          } else {
            tracingOptions = { ...tracingOptions, trace: [] };
          }

          return {
            figures: update(state.figures, {
              [label.id]: {
                $splice: [
                  [
                    idx,
                    1,
                    {
                      id: figure.id,
                      type: figure.type,
                      points: figure.points,
                      tracingOptions,
                    },
                  ],
                ],
              },
            }),
          };
        });
        break;

      case 'delete':
        pushState(state => ({
          figures: update(state.figures, {
            [label.id]: {
              $splice: [[idx, 1]],
            },
          }),
        }));
        break;

      case 'unfinished':
        pushState(
          state => ({ unfinishedFigure: figure }),
          () => {
            const { unfinishedFigure } = this.props;
            const { type, points } = unfinishedFigure;
            if (type === 'bbox' && points.length >= 2) {
              this.handleChange('new', unfinishedFigure);
            }
          }
        );
        break;

      case 'recolor':
        if (label.id === newLabelId) return;
        pushState(state => ({
          figures: update(state.figures, {
            [label.id]: {
              $splice: [[idx, 1]],
            },
            [newLabelId]: {
              $push: [
                {
                  id: figure.id,
                  points: figure.points,
                  type: figure.type,
                  tracingOptions: figure.tracingOptions,
                },
              ],
            },
          }),
        }));
        break;

      default:
        throw new Error('unknown event type ' + eventType);
    }
  }

  render() {
    const {
      projectTitle,
      labels,
      status,
      imageUrl,
      imagesCount,
      imageLabeled,
      labelsCount,
      desc,
      comments,
      reference,
      onBack,
      onSkip,
      onSubmit,
      onCommentSubmit,
      onStatusChange,
      pushState,
      figures,
      unfinishedFigure,
      height,
      width,
      models,
      makePrediction,
    } = this.props;
    const {
      selected,
      selectedFigureId,
      reassigning,
      toggles,
      hotkeysPanel,
    } = this.state;

    const forwardedProps = {
      onBack,
      onSkip,
      onSubmit,
      models,
      makePrediction,
    };
    let selectedFigure = null;
    const allFigures = [];
    labels.forEach((label, i) => {
      figures[label.id].forEach(figure => {
        if (
          toggles[label.id] &&
          (label.type === 'bbox' || label.type === 'polygon')
        ) {
          allFigures.push({
            color: colors[i],
            points: figure.points,
            id: figure.id,
            type: figure.type,
            tracingOptions: figure.tracingOptions,
          });

          if (figure.id === selectedFigureId) {
            selectedFigure = { ...figure, color: colors[i] };
          }
        }
      });
    });
    figures.__temp.forEach(figure => {
      allFigures.push({
        color: 'gray',
        ...figure,
      });
    });
    const sidebarProps = reassigning.status
      ? {
          title: 'Select the new label',
          selected: null,
          onSelect: selected => {
            const figure = this.canvasRef.current.getSelectedFigure();
            if (figure) {
              this.handleChange('recolor', figure, selected);
            }

            this.setState({ reassigning: { status: false, type: null } });
          },
          filter: label => label.type === reassigning.type,
          labelData: figures,
        }
      : {
          title: '라벨 목록',
          imageLabeled: imageLabeled,
          selected,
          onSelect: this.handleSelected,
          toggles,
          onToggle: label =>
            this.setState({
              toggles: update(toggles, {
                [label.id]: { $set: !toggles[label.id] },
              }),
            }),
          openHotkeys: () => this.setState({ hotkeysPanel: true }),
          onFormChange: (labelId, newValue) =>
            pushState(state => ({
              figures: update(figures, { [labelId]: { $set: newValue } }),
            })),
          labelData: figures,
        };

    const hotkeysPanelDOM = hotkeysPanel ? (
      <HotkeysPanel
        labels={labels.map(label => label.name)}
        onClose={() => this.setState({ hotkeysPanel: false })}
      />
    ) : null;

    let toolbarDOM = null;
    const toolbarStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10000,
    };

    if (selectedFigure && selectedFigure.type === 'polygon') {
      const options = selectedFigure.tracingOptions || {
        enabled: false,
        smoothing: 0.3,
        precision: 0,
        trace: [],
      };
      const handler = (property, value) => {
        this.handleChange(
          'replace',
          update(selectedFigure, {
            tracingOptions: {
              $set: update(options, { [property]: { $set: value } }),
            },
          })
        );
      };

      toolbarDOM = (
        <PathToolbar style={toolbarStyle} onChange={handler} {...options} />
      );
    }

    const demoBar = this.props.demo ? (
      <div
        style={{
          width: '100%',
          flex: '0 0 auto',
          background: '#FFD700',
          padding: '5px 10px',
          fontWeight: 800,
          textAlign: 'center',
        }}
      >
        This is a demo page. The changes will not be saved and all network
        responses are static.{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/Slava/label-tool"
        >
          GitHub repo
        </a>
      </div>
    ) : null;

    return this.state.embedded ? (
      <div style={{ position: 'relative', height: '100vh' }}>
        <Canvas
          url={imageUrl}
          height={height}
          width={width}
          figures={allFigures}
          unfinishedFigure={unfinishedFigure}
          onChange={this.handleChange}
          onReassignment={type =>
            this.setState({ reassigning: { status: true, type } })
          }
          onSelectionChange={this.handleSelectionChange}
          ref={this.canvasRef}
          zoom="-2"
          disableInteraction="true"
          // style={{ flex: 1 }}
        />
      </div>
    ) : (
      <div
        style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}
      >
        {demoBar}
        <div style={{ display: 'flex', flex: 1, height: '100%' }}>
          <Hotkeys
            keyName="ctrl+z,space,enter"
            onKeyDown={key => {
              if (key === 'space' && !this.state.focused) {
                onSkip();
              } else if (key === 'enter' && !this.state.focused) {
                onSubmit();
              }
            }}
          >
            <Sidebar
              labels={labels}
              {...sidebarProps}
              {...forwardedProps}
              style={{ flex: 1, maxWidth: 300 }}
            />
            {hotkeysPanelDOM}
            <div
              style={{
                flex: 4,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <Reference {...reference} />
              <div style={{ width: '80%', margin: '0 auto', padding: 16 }}>
                <h2 style={{ paddingTop: 16, textAlign: 'center' }}>
                  {projectTitle}
                </h2>

                <Status status={status} onChange={onStatusChange} />
                <Progress imagesCount={imagesCount} labelsCount={labelsCount} />
              </div>
              <div style={{ position: 'relative', height: '100%', zIndex: 5 }}>
                {toolbarDOM}
                <Canvas
                  url={imageUrl}
                  height={height}
                  width={width}
                  figures={allFigures}
                  unfinishedFigure={unfinishedFigure}
                  onChange={this.handleChange}
                  onReassignment={type =>
                    this.setState({ reassigning: { status: true, type } })
                  }
                  onSelectionChange={this.handleSelectionChange}
                  ref={this.canvasRef}
                  style={{ flex: 1 }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '3.6em',
                  right: '3.6em',
                  bottom: '1em',
                  zIndex: 10,
                }}
              >
                {desc ? (
                  <Description desc={desc} />
                ) : (
                  <Description desc="해당 이미지는 추가 설명이 없습니다." />
                )}
              </div>
            </div>
          </Hotkeys>
          {/* comment 추가 */}
          <Comment
            comments={comments}
            onSubmit={onCommentSubmit}
            focus={() => {
              this.setState({ focused: true });
            }}
            blur={() => {
              this.setState({ focused: false });
            }}
          />
        </div>
      </div>
    );
  }
}

export default withLoadImageData(withHistory(LabelingApp));
