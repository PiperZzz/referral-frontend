import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Upload, 
  message, 
  Space, 
  Tag, 
  Tooltip,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  PlusOutlined, 
  UploadOutlined,
  WechatOutlined,
  MailOutlined,
  TeamOutlined,
  TrophyOutlined,
  LogoutOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { UserApiService, UserApiUtils, type UserProfileDto as UserProfileType, type CandidateResponseDto as Candidate, type SystemStats } from '../services/userApi';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  // 状态管理
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({ 
    totalOpenReferrals: 0, 
    totalConnections: 0, 
    totalUsers: 0, 
    totalActiveCandidates: 0 
  });
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newReferralModalVisible, setNewReferralModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [editForm] = Form.useForm();
  const [referralForm] = Form.useForm();
  const { logout, isAuthenticated } = useAuth();

  // 加载用户数据
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // 添加调试信息
      console.log('🔍 开始加载用户数据...');
      console.log('💾 当前localStorage内容:', {
        authToken: localStorage.getItem('authToken'),
        userInfo: localStorage.getItem('userInfo'),
        primaryRole: localStorage.getItem('primaryRole')
      });
      
      // 并行加载用户资料、候选人列表和系统统计
      const [profileData, candidatesData, statsData] = await Promise.all([
        UserApiService.getUserProfile(),
        UserApiService.getUserCandidates(),
        UserApiService.getSystemStats(),
      ]);

      console.log('📊 加载的数据:', { profileData, candidatesData, statsData });

      setProfile(profileData);
      setCandidates(candidatesData);
      setSystemStats(statsData);
      
    } catch (error: any) {
      console.error('❌ 加载用户数据失败:', error);
      message.error('加载用户数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadUserData();
  }, []);

  // 状态标签渲染
  const renderStatus = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'orange', text: '待审核' },
      APPROVED: { color: 'green', text: '已批准' },
      TRAINING: { color: 'blue', text: '培训中' },
      MARKETING: { color: 'purple', text: '市场推广' },
      REJECTED: { color: 'red', text: '已拒绝' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 用户等级渲染
  const renderUserLevel = (level: number) => {
    const levelInfo = UserApiUtils.getUserLevelInfo(level);
    return (
      <div className="flex items-center">
        <TrophyOutlined style={{ color: levelInfo.color, marginRight: 4 }} />
        <Text style={{ color: levelInfo.color, fontWeight: 'bold' }}>
          等级 {level} - {levelInfo.text}
        </Text>
      </div>
    );
  };

  // 表格列定义
  const columns: ColumnsType<Candidate> = [
    {
      title: '候选人姓名',
      dataIndex: 'candidateName',
      key: 'candidateName',
      width: 120,
    },
    {
      title: '添加日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => UserApiUtils.formatDate(date),
    },
    {
      title: '微信号',
      dataIndex: 'candidateWechat',
      key: 'candidateWechat',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '备注',
      dataIndex: 'adminComments',
      key: 'adminComments',
      width: 150,
      ellipsis: true,
      render: (comments: string) => comments || '暂无备注',
    },
    {
      title: '简历',
      key: 'resume',
      width: 80,
      render: (_, record) => (
        record.hasResume ? (
          <Button 
            type="link" 
            size="small"
            onClick={() => handleDownloadResume(record.id)}
          >
            下载
          </Button>
        ) : (
          <Text type="secondary">无</Text>
        )
      ),
    },
  ];

  // 处理简历下载
  const handleDownloadResume = async (candidateId: number) => {
    try {
      message.loading('正在下载简历...', 0);
      
      const blob = await UserApiService.downloadCandidateResume(candidateId);
      const candidate = candidates.find(c => c.id === candidateId);
      const filename = candidate?.resumeFilename || `resume_${candidateId}.pdf`;
      
      UserApiUtils.downloadFile(blob, filename);
      message.destroy();
      message.success('简历下载成功');
      
    } catch (error: any) {
      message.destroy();
      message.error('下载简历失败: ' + error.message);
    }
  };

  // 处理编辑用户信息
  const handleEditProfile = () => {
    if (profile) {
      editForm.setFieldsValue({
        wechatId: profile.wechatId
      });
      setEditModalVisible(true);
    }
  };

  // 保存用户信息
  const handleSaveProfile = async () => {
    try {
      setSubmitLoading(true);
      const values = await editForm.validateFields();
      
      const updatedProfile = await UserApiService.updateUserProfile({
        wechatId: values.wechatId
      });
      
      setProfile(updatedProfile);
      message.success('用户信息更新成功');
      setEditModalVisible(false);
      
    } catch (error: any) {
      message.error('更新失败: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // 处理新增推荐
  const handleNewReferral = () => {
    referralForm.resetFields();
    setFileList([]);
    setNewReferralModalVisible(true);
  };

  // 保存新推荐
  const handleSaveReferral = async () => {
    try {
      setSubmitLoading(true);
      const values = await referralForm.validateFields();
      
      // 验证文件
      let resumeFile: File | undefined;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        const validation = UserApiUtils.validateFile(file);
        if (!validation.valid) {
          message.error(validation.message);
          return;
        }
        resumeFile = file;
      }

      // 创建候选人
      const newCandidate = await UserApiService.createCandidate(
        {
          candidateName: values.candidateName,
          candidateWechat: values.candidateWechat,
        },
        resumeFile
      );

      // 更新本地状态
      setCandidates(prev => [newCandidate, ...prev]);
      if (profile) {
        setProfile(prev => prev ? { ...prev, openCandidates: prev.openCandidates + 1 } : prev);
      }
      
      message.success('候选人推荐成功');
      setNewReferralModalVisible(false);
      referralForm.resetFields();
      setFileList([]);
      
    } catch (error: any) {
      message.error('推荐失败: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // 处理文件上传
  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  // 处理登出
  const handleLogout = () => {
    Modal.confirm({
      title: '确认登出',
      content: '您确定要退出登录吗？',
      onOk: () => {
        logout();
        message.info('已退出登录');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">用户信息加载失败</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 临时调试面板 */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 border-red-300" size="small">
            <div className="text-xs">
              <Text strong className="text-red-600">🔧 调试信息:</Text>
              <div>Token存在: {localStorage.getItem('authToken') ? '✅' : '❌'}</div>
              <div>用户认证: {isAuthenticated ? '✅' : '❌'}</div>
              <div>加载状态: {loading ? '⏳' : '✅'}</div>
              <div>用户数据: {profile ? '✅' : '❌'}</div>
              <Button size="small" onClick={loadUserData}>🔄 重新加载</Button>
            </div>
          </Card>
        )}

        {/* 页面头部 */}
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="mb-0">用户资料</Title>
          <Space>
            <Tooltip title="帮助">
              <Button icon={<QuestionCircleOutlined />} />
            </Tooltip>
            <Button 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Space>
        </div>

        {/* 系统统计信息 */}
        <Card className="mb-6" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row gutter={24}>
            <Col span={12}>
              <Statistic
                title={<span style={{ color: 'white' }}>总开放推荐数</span>}
                value={systemStats.totalOpenReferrals}
                valueStyle={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<span style={{ color: 'white' }}>总连接数</span>}
                value={systemStats.totalConnections}
                valueStyle={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        </Card>

        {/* 用户信息卡片 */}
        <Card 
          className="mb-6"
          style={{ border: '2px solid #f0f0f0' }}
        >
          <Row gutter={24} align="middle">
            <Col span={18}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className="flex items-center">
                      <UserOutlined className="text-blue-500 mr-2" />
                      <Text strong>用户名称：</Text>
                      <Text className="ml-2">{profile.name}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center">
                      <TrophyOutlined className="text-purple-500 mr-2" />
                      <Text strong>用户等级：</Text>
                      <div className="ml-2">
                        {renderUserLevel(profile.userLevel)}
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className="flex items-center">
                      <MailOutlined className="text-green-500 mr-2" />
                      <Text strong>邮箱地址：</Text>
                      <Text className="ml-2" type="secondary">{profile.email}</Text>
                      <Text className="ml-2 text-xs text-gray-400">(不可修改)</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center">
                      <TeamOutlined className="text-orange-500 mr-2" />
                      <Text strong>开放候选人：</Text>
                      <Text className="ml-2 font-bold text-blue-600">{profile.openCandidates}</Text>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className="flex items-center">
                      <WechatOutlined className="text-green-600 mr-2" />
                      <Text strong>微信号：</Text>
                      <Text className="ml-2">{profile.wechatId || '未设置'}</Text>
                    </div>
                  </Col>
                </Row>
              </Space>
            </Col>
            <Col span={6} className="text-right">
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                size="large"
                onClick={handleEditProfile}
              >
                编辑资料
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 候选人列表 */}
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>我的推荐候选人</span>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleNewReferral}
              >
                新增推荐
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={candidates}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* 编辑用户信息模态框 */}
        <Modal
          title="编辑用户信息"
          open={editModalVisible}
          onOk={handleSaveProfile}
          onCancel={() => setEditModalVisible(false)}
          width={500}
          confirmLoading={submitLoading}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item label="邮箱地址">
              <Input value={profile.email} disabled />
              <Text type="secondary" className="text-xs">邮箱地址不可修改</Text>
            </Form.Item>
            
            <Form.Item 
              label="微信号" 
              name="wechatId"
              rules={[
                { required: true, message: '请输入微信号' },
                { min: 3, message: '微信号至少3个字符' },
                { max: 20, message: '微信号最多20个字符' }
              ]}
            >
              <Input placeholder="请输入微信号" prefix={<WechatOutlined />} />
            </Form.Item>
          </Form>
        </Modal>

        {/* 新增推荐模态框 */}
        <Modal
          title="新增候选人推荐"
          open={newReferralModalVisible}
          onOk={handleSaveReferral}
          onCancel={() => setNewReferralModalVisible(false)}
          width={600}
          confirmLoading={submitLoading}
        >
          <Form form={referralForm} layout="vertical">
            <Form.Item 
              label="候选人姓名" 
              name="candidateName"
              rules={[
                { required: true, message: '请输入候选人姓名' },
                { min: 2, message: '姓名至少2个字符' }
              ]}
            >
              <Input placeholder="请输入候选人姓名" prefix={<UserOutlined />} />
            </Form.Item>
            
            <Form.Item 
              label="候选人微信号" 
              name="candidateWechat"
              rules={[
                { required: true, message: '请输入候选人微信号' },
                { min: 3, message: '微信号至少3个字符' }
              ]}
            >
              <Input placeholder="请输入候选人微信号" prefix={<WechatOutlined />} />
            </Form.Item>

            <Form.Item label="上传简历">
              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false} // 阻止自动上传
                accept=".pdf,.doc,.docx"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
              <Text type="secondary" className="text-xs">
                支持 PDF、DOC、DOCX 格式，文件大小不超过 10MB
              </Text>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default UserProfile;