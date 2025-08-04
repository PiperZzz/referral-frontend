import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Upload, 
  message, 
  Space 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { UserApiService, UserApiUtils, type UserProfileDto as UserProfileType, type CandidateResponseDto as Candidate } from '../services/userApi';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  // State management
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newReferralModalVisible, setNewReferralModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [editForm] = Form.useForm();
  const [referralForm] = Form.useForm();
  const { logout } = useAuth();

  // Load user data
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const [profileData, candidatesData] = await Promise.all([
        UserApiService.getUserProfile(),
        UserApiService.getUserCandidates(),
      ]);

      setProfile(profileData);
      setCandidates(candidatesData);
      
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      message.error('Failed to load user data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Status rendering
  const renderStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Pending',
      APPROVED: 'Approved', 
      TRAINING: 'Training',
      MARKETING: 'Marketing',
      REJECTED: 'Rejected'
    };
    return statusMap[status] || status;
  };

  // Handle profile edit
  const handleProfileEdit = () => {
    if (profile) {
      editForm.setFieldsValue({
        name: profile.name,
        wechatId: profile.wechatId,
        phoneNumber: profile.phoneNumber
      });
      setEditModalVisible(true);
    }
  };

  const handleProfileUpdate = async (values: any) => {
    try {
      setSubmitLoading(true);
      await UserApiService.updateUserProfile(values);
      message.success('Profile updated successfully');
      setEditModalVisible(false);
      loadUserData();
    } catch (error: any) {
      message.error('Failed to update profile: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle new referral
  const handleNewReferral = async (values: any) => {
    try {
      setSubmitLoading(true);
      
      const formData = new FormData();
      formData.append('candidateName', values.candidateName);
      formData.append('candidateWechat', values.candidateWechat);
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('resume', fileList[0].originFileObj);
      }

      await UserApiService.createCandidate(formData);
      message.success('New referral submitted successfully');
      setNewReferralModalVisible(false);
      referralForm.resetFields();
      setFileList([]);
      loadUserData();
      
    } catch (error: any) {
      message.error('Failed to submit referral: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Table columns
  const columns: ColumnsType<Candidate> = [
    {
      title: 'Candidate Name',
      dataIndex: 'candidateName',
      key: 'candidateName',
      width: 150,
    },
    {
      title: 'Add Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => UserApiUtils.formatDate(date),
    },
    {
      title: 'WeChat',
      dataIndex: 'candidateWechat',
      key: 'candidateWechat',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: 'Comments',
      dataIndex: 'adminComments',
      key: 'adminComments',
      width: 200,
      ellipsis: true,
      render: (comments: string) => comments || 'No comments',
    },
    {
      title: 'Resume',
      key: 'resume',
      width: 80,
      render: (_, record) => (
        record.hasResume ? 'Yes' : 'No'
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Text>Loading...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation */}
      <div className="absolute top-6 right-6">
        <Space size={16}>
          <Button
            type="default"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {/* Help functionality */}}
          >
            Help
          </Button>
          <Button
            type="default"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </div>

      {/* Main content */}
      <div className="p-8 max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <Title 
            level={1} 
            className="text-4xl font-normal text-gray-900 mb-0"
            style={{ fontWeight: 400, fontSize: '2.5rem', marginBottom: 0 }}
          >
            User Profile
          </Title>
        </div>

        {/* User Information Section */}
        <div className="border-2 border-gray-800 mb-8" style={{ borderRadius: 0 }}>
          <div className="border-b-2 border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <Title level={4} className="mb-0 text-gray-900 font-normal">
                User Information
              </Title>
              <Button
                type="default"
                onClick={handleProfileEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Text className="text-sm text-gray-700 font-normal block mb-1">
                  User Name:
                </Text>
                <Text className="text-base text-gray-900">
                  {profile?.name || 'Not set'}
                </Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-700 font-normal block mb-1">
                  User Level:
                </Text>
                <Text className="text-base text-gray-900">
                  Level {profile?.userLevel || 1}
                </Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-700 font-normal block mb-1">
                  Email:
                </Text>
                <Text className="text-base text-gray-900">
                  {profile?.email}
                </Text>
                <Text className="text-xs text-gray-500 ml-2">
                  (Cannot be modified)
                </Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-700 font-normal block mb-1">
                  Open Candidates:
                </Text>
                <Text className="text-base text-gray-900 font-bold">
                  {profile?.openCandidates || 0}
                </Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-700 font-normal block mb-1">
                  WeChat ID:
                </Text>
                <Text className="text-base text-gray-900">
                  {profile?.wechatId || 'Not set'}
                </Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-700 font-normal block mb-1">
                  Phone Number:
                </Text>
                <Text className="text-base text-gray-900">
                  {profile?.phoneNumber || 'Not set'}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="border-2 border-gray-800" style={{ borderRadius: 0 }}>
          <div className="border-b-2 border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <Title level={4} className="mb-0 text-gray-900 font-normal">
                My Referrals
              </Title>
              <Button
                type="default"
                onClick={() => setNewReferralModalVisible(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                New Referral
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <Table
              columns={columns}
              dataSource={candidates}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                simple: true
              }}
              bordered
              size="small"
              style={{ 
                border: '1px solid #d9d9d9',
              }}
            />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        centered
        width={500}
      >
        <Form
          form={editForm}
          onFinish={handleProfileUpdate}
          layout="vertical"
          className="mt-6"
        >
          <Form.Item
            name="name"
            label="User Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input
              className="h-10 border-gray-300 rounded-none border-2"
              style={{ borderRadius: 0 }}
            />
          </Form.Item>

          <Form.Item
            name="wechatId"
            label="WeChat ID"
          >
            <Input
              className="h-10 border-gray-300 rounded-none border-2"
              style={{ borderRadius: 0 }}
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
          >
            <Input
              className="h-10 border-gray-300 rounded-none border-2"
              style={{ borderRadius: 0 }}
            />
          </Form.Item>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="default"
              onClick={() => setEditModalVisible(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="default"
              htmlType="submit"
              loading={submitLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>

      {/* New Referral Modal */}
      <Modal
        title="New Referral"
        open={newReferralModalVisible}
        onCancel={() => {
          setNewReferralModalVisible(false);
          referralForm.resetFields();
          setFileList([]);
        }}
        footer={null}
        centered
        width={500}
      >
        <Form
          form={referralForm}
          onFinish={handleNewReferral}
          layout="vertical"
          className="mt-6"
        >
          <Form.Item
            name="candidateName"
            label="Candidate Name"
            rules={[{ required: true, message: 'Please enter candidate name' }]}
          >
            <Input
              className="h-10 border-gray-300 rounded-none border-2"
              style={{ borderRadius: 0 }}
            />
          </Form.Item>

          <Form.Item
            name="candidateWechat"
            label="Candidate WeChat"
            rules={[{ required: true, message: 'Please enter candidate WeChat' }]}
          >
            <Input
              className="h-10 border-gray-300 rounded-none border-2"
              style={{ borderRadius: 0 }}
            />
          </Form.Item>

          <Form.Item
            label="Upload Resume"
          >
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <Button
                type="default"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Upload Resume
              </Button>
            </Upload>
          </Form.Item>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="default"
              onClick={() => {
                setNewReferralModalVisible(false);
                referralForm.resetFields();
                setFileList([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="default"
              htmlType="submit"
              loading={submitLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;