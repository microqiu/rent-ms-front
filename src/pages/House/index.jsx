import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Input, Drawer, Popconfirm } from 'antd';
import Draggable from 'react-draggable';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { getHouseList, deleteHouse } from '@/services/house';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import moment from 'moment';
import { request } from 'umi';
const { Dragger } = Upload;

const House = () => {

    const [importHouseVisible, setImportHouseVisible] = useState(false);

    const [dragDisable, setDragDisable] = useState(false);

    const [importHouseBounds, setImportHouseBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });

    const [fileList, setFileList] = useState([]);

    const [uploading, setUploading] = useState(false);

    const [tableLoading, setTableLoading] = useState(false);

    const draggleRef = useRef();

    const tableRef = useRef();

    const onStart = (event, uiData) => {
        const { clientWidth, clientHeight } = window?.document?.documentElement;
        const targetRect = draggleRef?.current?.getBoundingClientRect();
        setImportHouseBounds({
          bounds: {
            left: -targetRect?.left + uiData?.x,
            right: clientWidth - (targetRect?.right - uiData?.x),
            top: -targetRect?.top + uiData?.y,
            bottom: clientHeight - (targetRect?.bottom - uiData?.y),
          },
        });
    };

    const onDelete = async (id) => {
        console.log(id);
        setTableLoading(true);
        await deleteHouse(id);
        setTableLoading(false);
        tableRef.current.reload();
    }

    const importHouseOk = () => {
        console.log(fileList);
        if(fileList.length === 0) {
            message.warn('请先选择要导入的文件！');
            return;
        }
        let file = fileList[0];
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        request('/api/house/import', {
            method: 'post',
            processData: false,
            data: formData
        }).then((res) => {
            console.log(res);
            setFileList([]);
            setUploading(false);
            message.success('导入成功.');
        }).catch(e => {
            console.error(e);
            setUploading(false);
            message.error('导入失败.');
        })
    }

    const importHouseCancel = () => setImportHouseVisible(false);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '县区',
            dataIndex: 'district',
        },
        {
            title: '商圈',
            dataIndex: 'businessDistrict',
            search: false,
            render: (record) => {
                return <span>{record.businessDistrict}</span>
            }
        },
        {
            title: '小区',
            dataIndex: 'community',
            search: false,
            render: (record) => {
                return <span>{record.community}</span>
            }
        },
        {
            title: '地址',
            dataIndex: 'address',
            search: false
        },
        {
            title: '添加时间',
            dataIndex: 'createTime',
            search: false,
            render: (record) => {
                return moment(record.createTime).format('yyyy-MM-DD')
            }
        },
        {
            title: '操作',
            search: false,
            render: (record) => {
                return (
                <Popconfirm title="删除?" onConfirm={() => onDelete(record.id)}>
                    <Button>删除</Button>
                </Popconfirm>
                );
            }
        }
    ];

    return (
        <PageContainer>
            <ProTable
                actionRef={tableRef}
                loading={tableLoading}
                columns={columns}
                request={getHouseList}
                headerTitle={"房源列表"}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                    >
                        <PlusOutlined /> 新建
                    </Button>,
                    <Button
                        type="button"
                        key="primary"
                        onClick={() => {setImportHouseVisible(true)}}
                    >
                        <PlusOutlined /> 导入
                    </Button>,
                ]}
            />
            <Modal
                title={
                    <div
                        style={{
                            width: '100%',
                            cursor: 'move',
                        }}
                        onMouseOver={() => {
                            if (dragDisable) {
                                setDragDisable(false);
                            }
                        }}
                        onMouseOut={() => {
                            setDragDisable(true);
                        }}
                        // fix eslintjsx-a11y/mouse-events-have-key-events
                        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
                        onFocus={() => { }}
                        onBlur={() => { }}
                    // end
                    >
                        导入房源
                    </div>
                }
                confirmLoading={uploading}
                visible={importHouseVisible}
                onOk={importHouseOk}
                onCancel={importHouseCancel}
                modalRender={modal => (
                    <Draggable
                        disabled={dragDisable}
                        bounds={importHouseBounds}
                        onStart={(event, uiData) => onStart(event, uiData)}
                    >
                        <div ref={draggleRef}>{modal}</div>
                    </Draggable>
                )}
            >
                <Dragger fileList={fileList} 
                        beforeUpload={() => {return false;}} 
                        multiple={false} onChange={(p1, p2) => {
                            console.log('on change', p1, p2);
                            if (p1.fileList.length > 0) {
                                setFileList([p1.file]);
                            } else {
                                setFileList([]);
                            }
                        }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域上传文件,点击确定开始导入</p>
                    <p className="ant-upload-hint">
                        支持单文件上传，格式为excel
                    </p>
                </Dragger>
            </Modal>
        </PageContainer>
    );

}

export default House;