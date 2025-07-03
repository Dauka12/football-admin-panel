import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  const emailAddress = 'sportempire2025@gmail.com';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Sport Empire</Link>
          <Link to="/auth" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors text-sm md:text-base">
            Sign In
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header section with logo */}
          <div className="bg-blue-900 text-white py-8 px-6 md:px-10 text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-blue-100 text-sm md:text-base">Last updated: July 3, 2025</p>
          </div>
          
          {/* Content section */}
          <div className="p-6 md:p-10 text-gray-700">
            <p className="mb-6 leading-relaxed">
              This privacy policy applies to the <strong className="text-blue-900">Sport Empire</strong> app (hereby referred to as "Application") 
              for mobile devices that was created by <strong className="text-blue-900">Yerlan Tulakbayev</strong> (hereby referred to as "Service Provider") 
              as a Free service. This service is intended for use "AS IS".
            </p>

            {/* Information Collection Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Information Collection and Use</h2>
              <p className="mb-4 leading-relaxed">
                The Application collects information when you download and use it. 
                This information may include information such as:
              </p>
              <ul className="list-disc pl-8 mb-4 space-y-2">
                <li>Your device's Internet Protocol address (e.g. IP address)</li>
                <li>The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</li>
                <li>The time spent on the Application</li>
                <li>The operating system you use on your mobile device</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                The Application does not gather precise information about the location of your mobile device.
              </p>

              <p className="mb-4 leading-relaxed">
                The Service Provider may use the information you provided to contact you from time to time to provide you with 
                important information, required notices and marketing promotions.
              </p>

              <p className="mb-4 leading-relaxed">
                For a better experience, while using the Application, the Service Provider may require you 
                to provide us with certain personally identifiable information, including but not limited to Казаишвили Лаша. 
                The information that the Service Provider request will be retained by them and used as described in this privacy policy.
              </p>
            </section>

            {/* Third Party Access Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Third Party Access</h2>
              <p className="mb-4 leading-relaxed">
                Only aggregated, anonymized data is periodically transmitted to external services to aid 
                the Service Provider in improving the Application and their service. The Service Provider may share 
                your information with third parties in the ways that are described in this privacy statement.
              </p>

              <p className="mb-4 leading-relaxed">
                Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. 
                Below are the links to the Privacy Policy of the third-party service providers used by the Application:
              </p>

              <ul className="list-disc pl-8 mb-4 space-y-2">
                <li><a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Play Services</a></li>
              </ul>

              <p className="mb-4 leading-relaxed">
                The Service Provider may disclose User Provided and Automatically Collected Information:
              </p>

              <ul className="list-disc pl-8 mb-4 space-y-2">
                <li>as required by law, such as to comply with a subpoena, or similar legal process;</li>
                <li>when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or 
                    the safety of others, investigate fraud, or respond to a government request;</li>
                <li>with their trusted services providers who work on their behalf, do not have an independent use of the 
                    information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.</li>
              </ul>
            </section>

            {/* Opt-Out Rights Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Opt-Out Rights</h2>
              <p className="mb-4 leading-relaxed">
                You can stop all collection of information by the Application easily by uninstalling it. 
                You may use the standard uninstall processes as may be available as part of your mobile device or 
                via the mobile application marketplace or network.
              </p>
            </section>

            {/* Data Retention Policy Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Data Retention Policy</h2>
              <p className="mb-4 leading-relaxed">
                The Service Provider will retain User Provided data for as long as you use the Application and for a 
                reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via 
                the Application, please contact them at{' '}
                <a href={`mailto:${emailAddress}`} className="text-blue-600 hover:underline font-medium">{emailAddress}</a>{' '}
                and they will respond in a reasonable time.
              </p>
            </section>

            {/* Children Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Children</h2>
              <p className="mb-4 leading-relaxed">
                The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
              </p>

              <p className="mb-4 leading-relaxed">
                The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect 
                personally identifiable information from children under 13 years of age. In the case the Service Provider 
                discover that a child under 13 has provided personal information, the Service Provider will immediately delete this 
                from their servers. If you are a parent or guardian and you are aware that your child has provided us with 
                personal information, please contact the Service Provider ({' '}
                <a href={`mailto:${emailAddress}`} className="text-blue-600 hover:underline font-medium">{emailAddress}</a>{' '}) 
                so that they will be able to take the necessary actions.
              </p>
            </section>

            {/* Security Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Security</h2>
              <p className="mb-4 leading-relaxed">
                The Service Provider is concerned about safeguarding the confidentiality of your information. 
                The Service Provider provides physical, electronic, and procedural safeguards to protect 
                information the Service Provider processes and maintains.
              </p>
            </section>

            {/* Changes Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Changes</h2>
              <p className="mb-4 leading-relaxed">
                This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of 
                any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to 
                consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
              </p>

              <p className="mb-4 leading-relaxed font-medium">
                This privacy policy is effective as of July 3, 2025
              </p>
            </section>

            {/* Your Consent Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Your Consent</h2>
              <p className="mb-4 leading-relaxed">
                By using the Application, you are consenting to the processing of your information as set forth in 
                this Privacy Policy now and as amended by us.
              </p>
            </section>

            {/* Contact Us Section */}
            <section className="mb-4">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900 border-b border-gray-200 pb-2">Contact Us</h2>
              <p className="mb-4 leading-relaxed">
                If you have any questions regarding privacy while using the Application, or have questions about 
                the practices, please contact the Service Provider via email at{' '}
                <a href={`mailto:${emailAddress}`} className="text-blue-600 hover:underline font-medium">{emailAddress}</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-center md:text-left">&copy; 2025 Sport Empire. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <Link to="/privacy-policy" className="hover:text-blue-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-blue-300 transition-colors">Terms of Service</Link>
              <a href={`mailto:${emailAddress}`} className="hover:text-blue-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
