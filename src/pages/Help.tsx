import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Modal, message } from 'antd';
import { Link } from 'react-router-dom';
import { utilityAPI } from '../services/api';

const { Title, Text } = Typography;

interface AdminContact {
  id: number;
  email: string;
  wechatId?: string;
  phoneNumber?: string;
}

const Help: React.FC = () => {
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadAdminContacts = async () => {
    try {
      setLoading(true);
      const response = await utilityAPI.getAdminHelp();
      
      if (response.success && response.data) {
        setAdminContacts(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load admin contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminContacts();
  }, []);

  const showContactModal = () => {
    setIsModalVisible(true);
    if (adminContacts.length === 0) {
      loadAdminContacts();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top right navigation */}
      <div className="absolute top-6 right-6">
        <Space size={16}>
          <Link 
            to="/login"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/register"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Signup
          </Link>
        </Space>
      </div>

      {/* Main content - centered like login page */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-12">
            <Title 
              level={1} 
              className="text-4xl font-normal text-gray-900 mb-0"
              style={{ fontWeight: 400, fontSize: '2.5rem', marginBottom: 0 }}
            >
              MOYI Referral Help
            </Title>
          </div>

          {/* Help Content */}
          <div className="space-y-8">
            {/* How to Register */}
            <div className="border-b border-gray-200 pb-6">
              <Title level={4} className="text-gray-900 mb-3">
                How do I register for an account?
              </Title>
              <Text className="text-gray-600 text-base leading-relaxed">
                Click the "Signup" button on the login page. Fill in your email, password, and optional information like WeChat ID. After registration, wait for an administrator to activate your account.
              </Text>
            </div>

            {/* Forget Password */}
            <div className="border-b border-gray-200 pb-6">
              <Title level={4} className="text-gray-900 mb-3">
                I forget my password. What should I do?
              </Title>
              <Text className="text-gray-600 text-base leading-relaxed">
                Click "Forget Password" on the login page, enter your registered email address, and we will send you a password reset link. Check your email and follow the instructions.
              </Text>
            </div>

            {/* Submit Referral */}
            <div className="border-b border-gray-200 pb-6">
              <Title level={4} className="text-gray-900 mb-3">
                How do I submit a new referral?
              </Title>
              <Text className="text-gray-600 text-base leading-relaxed">
                After logging in, go to your profile page and click "New Referral". Fill in the candidate's name and WeChat ID, optionally upload their resume, then submit.
              </Text>
            </div>

            {/* Track Status */}
            <div className="border-b border-gray-200 pb-6">
              <Title level={4} className="text-gray-900 mb-3">
                How can I track my referral status?
              </Title>
              <Text className="text-gray-600 text-base leading-relaxed">
                In your user profile, you can see all your submitted candidates and their current status in the candidates table.
              </Text>
            </div>

            {/* Contact Admin */}
            <div className="text-center pt-4">
              <Title level={4} className="text-gray-900 mb-4">
                Need more help?
              </Title>
              <Text className="text-gray-600 text-base leading-relaxed block mb-6">
                If you cannot find the answer to your question, our administrators are here to help you.
              </Text>
              
              <Button
                type="default"
                size="large"
                onClick={showContactModal}
                className="h-12 px-8 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                style={{
                  borderRadius: 0,
                  fontWeight: 'normal',
                }}
              >
                Contact Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        title="Administrator Contacts"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setIsModalVisible(false)}
            className="h-10 px-6 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50"
            style={{ borderRadius: 0 }}
          >
            Close
          </Button>
        ]}
        width={500}
      >
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading admin contacts...</div>
          </div>
        ) : adminContacts.length > 0 ? (
          <div className="space-y-4">
            {adminContacts.map((admin) => (
              <div key={admin.id} className="border border-gray-200 p-4" style={{ borderRadius: 0 }}>
                <div className="space-y-2">
                  <div>
                    <Text strong>Email: {admin.email}</Text>
                  </div>
                  {admin.wechatId && (
                    <div>
                      <Text>WeChat: {admin.wechatId}</Text>
                    </div>
                  )}
                  {admin.phoneNumber && (
                    <div>
                      <Text>Phone: {admin.phoneNumber}</Text>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <div>No admin contact information available at the moment.</div>
            <div className="mt-2 text-sm">Please try again later.</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Help;